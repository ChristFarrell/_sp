#define _WIN32_WINNT 0x0600  /* Windows Vista+ for better networking */

#include <winsock2.h>
#include <ws2tcpip.h>
#include <windows.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <time.h>
#include <errno.h>
#include <sys/stat.h>
#include <io.h>
#include <fcntl.h>

#include "protocol.h"

/* ════════════════════════════════════════════
   Byte-order helpers (MinGW lacks endian.h)
   ════════════════════════════════════════════ */

static inline uint64_t my_htobe64(uint64_t x)
{
    return (((uint64_t)htonl((uint32_t)(x & 0xFFFFFFFFULL))) << 32) |
            ((uint64_t)htonl((uint32_t)(x >> 32)));
}

static inline uint64_t my_be64toh(uint64_t x)
{
    return my_htobe64(x);   /* same operation — it's its own inverse */
}

#define htobe64(x) my_htobe64(x)
#define be64toh(x) my_be64toh(x)

/* ── Configuration ── */
static char g_root[MAX_PATH] = "E:\\";
static int  g_port = PORT;
static volatile int g_running = 1;

/* ── Logging ── */
#define LOG(fmt, ...) do { \
    time_t t = time(NULL); \
    struct tm *lt = localtime(&t); \
    printf("[%02d:%02d:%02d] " fmt "\n", lt->tm_hour, lt->tm_min, lt->tm_sec, ##__VA_ARGS__); \
    fflush(stdout); \
} while(0)

#define ERR(fmt, ...) do { \
    LOG("ERROR: " fmt, ##__VA_ARGS__); \
} while(0)

/* ════════════════════════════════════════════
   Path helpers
   ════════════════════════════════════════════ */

/* Convert POSIX path to Windows path within root */
static int resolve_path(const char *posix_path, char *out_win, size_t out_size)
{
    /* posix_path starts with /, e.g., "/Documents/file.txt" */
    /* Convert to E:\Documents\file.txt */
    
    if (!posix_path || posix_path[0] != '/') {
        return -EINVAL;
    }
    
    /* Build absolute Windows path */
    size_t root_len = strlen(g_root);
    if (root_len + strlen(posix_path) >= out_size) {
        return -ENAMETOOLONG;
    }
    
    strcpy(out_win, g_root);
    
    /* Append path, converting / to \ */
    const char *p = posix_path + 1;  /* skip leading / */
    char *dst = out_win + root_len;
    
    while (*p) {
        if (*p == '/') {
            *dst++ = '\\';
        } else {
            *dst++ = *p;
        }
        p++;
    }
    *dst = '\0';
    
    /* Security: check for .. traversal */
    if (strstr(out_win, "..")) {
        return -EACCES;
    }
    
    /* Ensure path is within root */
    char abs_root[MAX_PATH], abs_path[MAX_PATH];
    if (!GetFullPathNameA(g_root, MAX_PATH, abs_root, NULL) ||
        !GetFullPathNameA(out_win, MAX_PATH, abs_path, NULL)) {
        return -EINVAL;
    }
    
    if (strncmp(abs_path, abs_root, strlen(abs_root)) != 0) {
        return -EACCES;
    }
    
    return 0;
}

/* ════════════════════════════════════════════
   Time conversion helpers
   ════════════════════════════════════════════ */

/* Convert Windows FILETIME to Unix timestamp */
static int64_t filetime_to_unix(FILETIME ft)
{
    ULARGE_INTEGER ull;
    ull.LowPart = ft.dwLowDateTime;
    ull.HighPart = ft.dwHighDateTime;
    /* FILETIME is 100-nanosecond intervals since 1601-01-01
       Unix epoch is 1970-01-01, difference is 11644473600 seconds */
    return (int64_t)(ull.QuadPart / 10000000ULL - 11644473600ULL);
}

/* Convert Unix timestamp to Windows FILETIME */
static FILETIME unix_to_filetime(int64_t unix_time)
{
    ULARGE_INTEGER ull;
    ull.QuadPart = ((uint64_t)unix_time + 11644473600ULL) * 10000000ULL;
    FILETIME ft;
    ft.dwLowDateTime  = ull.LowPart;
    ft.dwHighDateTime = ull.HighPart;
    return ft;
}

/* ════════════════════════════════════════════
   Win32 ↔ POSIX error mapping
   ════════════════════════════════════════════ */

static int win_to_errno(DWORD err)
{
    switch (err) {
        case ERROR_SUCCESS:           return 0;
        case ERROR_FILE_NOT_FOUND:    return -ENOENT;
        case ERROR_PATH_NOT_FOUND:    return -ENOENT;
        case ERROR_ACCESS_DENIED:     return -EACCES;
        case ERROR_ALREADY_EXISTS:    return -EEXIST;
        case ERROR_FILE_EXISTS:       return -EEXIST;
        case ERROR_INVALID_DRIVE:     return -ENOENT;
        case ERROR_DISK_FULL:         return -ENOSPC;
        case ERROR_NOT_READY:         return -EIO;
        case ERROR_WRITE_PROTECT:     return -EROFS;
        case ERROR_SHARING_VIOLATION: return -EBUSY;
        case ERROR_LOCK_VIOLATION:    return -EBUSY;
        case ERROR_HANDLE_EOF:        return 0;
        case ERROR_INVALID_PARAMETER: return -EINVAL;
        case ERROR_DIRECTORY:         return -ENOTDIR;
        case ERROR_DIR_NOT_EMPTY:     return -ENOTEMPTY;
        default:                      return -EIO;
    }
}

/* ════════════════════════════════════════════
   Socket helpers
   ════════════════════════════════════════════ */

static int recv_all(SOCKET sock, void *buf, size_t len)
{
    size_t got = 0;
    while (got < len) {
        int n = recv(sock, (char*)buf + got, (int)(len - got), 0);
        if (n <= 0) return -1;
        got += n;
    }
    return 0;
}

static int send_all(SOCKET sock, const void *buf, size_t len)
{
    size_t sent = 0;
    while (sent < len) {
        int n = send(sock, (const char*)buf + sent, (int)(len - sent), 0);
        if (n <= 0) return -1;
        sent += n;
    }
    return 0;
}

/* ════════════════════════════════════════════
   File operation handlers
   ════════════════════════════════════════════ */

static int handle_getattr(const char *path, void **out_data, uint32_t *out_len)
{
    char win_path[MAX_PATH];
    int ret = resolve_path(path, win_path, sizeof(win_path));
    if (ret < 0) return ret;
    
    WIN32_FILE_ATTRIBUTE_DATA fad;
    if (!GetFileAttributesExA(win_path, GetFileExInfoStandard, &fad)) {
        return win_to_errno(GetLastError());
    }
    
    WireStat *ws = malloc(sizeof(WireStat));
    if (!ws) return -ENOMEM;
    
    memset(ws, 0, sizeof(*ws));
    
    /* Mode */
    uint32_t mode = 0;
    if (fad.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) {
        mode = S_IFDIR | 0755;
    } else {
        mode = S_IFREG | 0644;
    }
    if (fad.dwFileAttributes & FILE_ATTRIBUTE_READONLY) {
        mode &= ~0222;  /* remove write bits */
    }
    
    /* Size */
    uint64_t size = ((uint64_t)fad.nFileSizeHigh << 32) | fad.nFileSizeLow;
    
    /* Times (convert FILETIME to Unix epoch) */
    int64_t atime = filetime_to_unix(fad.ftLastAccessTime);
    int64_t mtime = filetime_to_unix(fad.ftLastWriteTime);
    int64_t ctime = filetime_to_unix(fad.ftCreationTime);
    
    /* Fill wire struct (network byte order) */
    ws->mode   = htonl(mode);
    ws->nlink  = htonl(1);
    ws->size   = htobe64(size);
    ws->atime  = htobe64((uint64_t)atime);
    ws->mtime  = htobe64((uint64_t)mtime);
    ws->ctime  = htobe64((uint64_t)ctime);
    ws->blocks = htobe64((size + 511) / 512);
    
    *out_data = ws;
    *out_len  = sizeof(WireStat);
    return 0;
}

static int handle_readdir(const char *path, void **out_data, uint32_t *out_len)
{
    char win_path[MAX_PATH];
    int ret = resolve_path(path, win_path, sizeof(win_path));
    if (ret < 0) return ret;
    
    /* Append \* for FindFirstFile — buffer needs MAX_PATH + 2 for "\\*" */
    char pattern[MAX_PATH + 3];
    snprintf(pattern, sizeof(pattern), "%s\\*", win_path);
    
    WIN32_FIND_DATAA fd;
    HANDLE hFind = FindFirstFileA(pattern, &fd);
    if (hFind == INVALID_HANDLE_VALUE) {
        DWORD err = GetLastError();
        if (err == ERROR_FILE_NOT_FOUND) {
            /* Empty directory */
            *out_data = malloc(1);
            *out_len = 0;
            return 0;
        }
        return win_to_errno(err);
    }
    
    /* Build null-separated list of filenames */
    size_t buf_size = 4096;
    char *buf = malloc(buf_size);
    if (!buf) { FindClose(hFind); return -ENOMEM; }
    
    size_t pos = 0;
    do {
        /* Skip . and .. */
        if (strcmp(fd.cFileName, ".") == 0 || strcmp(fd.cFileName, "..") == 0)
            continue;
        
        size_t name_len = strlen(fd.cFileName) + 1;
        
        /* Grow buffer if needed */
        if (pos + name_len > buf_size) {
            buf_size *= 2;
            char *new_buf = realloc(buf, buf_size);
            if (!new_buf) { free(buf); FindClose(hFind); return -ENOMEM; }
            buf = new_buf;
        }
        
        memcpy(buf + pos, fd.cFileName, name_len);
        pos += name_len;
        
    } while (FindNextFileA(hFind, &fd));
    
    FindClose(hFind);
    
    *out_data = buf;
    *out_len  = (uint32_t)pos;
    return 0;
}

static int handle_open(const char *path, uint32_t flags)
{
    char win_path[MAX_PATH];
    int ret = resolve_path(path, win_path, sizeof(win_path));
    if (ret < 0) return ret;
    
    /* Just check if file exists and is accessible */
    DWORD access = GENERIC_READ;
    if (flags & O_WRONLY) access = GENERIC_WRITE;
    if (flags & O_RDWR)   access = GENERIC_READ | GENERIC_WRITE;
    
    HANDLE h = CreateFileA(win_path, access, FILE_SHARE_READ | FILE_SHARE_WRITE,
                           NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
    if (h == INVALID_HANDLE_VALUE) {
        return win_to_errno(GetLastError());
    }
    CloseHandle(h);
    return 0;
}

static int handle_read(const char *path, uint64_t offset, uint64_t size,
                       void **out_data, uint32_t *out_len)
{
    char win_path[MAX_PATH];
    int ret = resolve_path(path, win_path, sizeof(win_path));
    if (ret < 0) return ret;
    
    HANDLE h = CreateFileA(win_path, GENERIC_READ, FILE_SHARE_READ | FILE_SHARE_WRITE,
                           NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
    if (h == INVALID_HANDLE_VALUE) {
        return win_to_errno(GetLastError());
    }
    
    /* Seek to offset */
    LARGE_INTEGER li;
    li.QuadPart = (LONGLONG)offset;
    if (!SetFilePointerEx(h, li, NULL, FILE_BEGIN)) {
        CloseHandle(h);
        return win_to_errno(GetLastError());
    }
    
    /* Allocate buffer */
    void *buf = malloc((size_t)size);
    if (!buf) { CloseHandle(h); return -ENOMEM; }
    
    /* Read data */
    DWORD bytes_read = 0;
    if (!ReadFile(h, buf, (DWORD)size, &bytes_read, NULL)) {
        DWORD err = GetLastError();
        free(buf); CloseHandle(h);
        return win_to_errno(err);
    }
    
    CloseHandle(h);
    *out_data = buf;
    *out_len  = bytes_read;
    return 0;
}

static int handle_write(const char *path, uint64_t offset, uint64_t size,
                        const void *data)
{
    char win_path[MAX_PATH];
    int ret = resolve_path(path, win_path, sizeof(win_path));
    if (ret < 0) return ret;
    
    HANDLE h = CreateFileA(win_path, GENERIC_WRITE, FILE_SHARE_READ | FILE_SHARE_WRITE,
                           NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
    if (h == INVALID_HANDLE_VALUE) {
        return win_to_errno(GetLastError());
    }
    
    /* Seek to offset */
    LARGE_INTEGER li;
    li.QuadPart = (LONGLONG)offset;
    if (!SetFilePointerEx(h, li, NULL, FILE_BEGIN)) {
        CloseHandle(h);
        return win_to_errno(GetLastError());
    }
    
    /* Write data */
    DWORD written = 0;
    if (!WriteFile(h, data, (DWORD)size, &written, NULL)) {
        CloseHandle(h);
        return win_to_errno(GetLastError());
    }
    
    CloseHandle(h);
    return 0;
}

static int handle_create(const char *path, uint32_t mode)
{
    char win_path[MAX_PATH];
    int ret = resolve_path(path, win_path, sizeof(win_path));
    if (ret < 0) return ret;
    
    HANDLE h = CreateFileA(win_path, GENERIC_WRITE, FILE_SHARE_READ | FILE_SHARE_WRITE,
                           NULL, CREATE_NEW, FILE_ATTRIBUTE_NORMAL, NULL);
    if (h == INVALID_HANDLE_VALUE) {
        return win_to_errno(GetLastError());
    }
    CloseHandle(h);
    return 0;
}

static int handle_unlink(const char *path)
{
    char win_path[MAX_PATH];
    int ret = resolve_path(path, win_path, sizeof(win_path));
    if (ret < 0) return ret;
    
    if (!DeleteFileA(win_path)) {
        return win_to_errno(GetLastError());
    }
    return 0;
}

static int handle_mkdir(const char *path, uint32_t mode)
{
    char win_path[MAX_PATH];
    int ret = resolve_path(path, win_path, sizeof(win_path));
    if (ret < 0) return ret;
    
    if (!CreateDirectoryA(win_path, NULL)) {
        return win_to_errno(GetLastError());
    }
    return 0;
}

static int handle_rmdir(const char *path)
{
    char win_path[MAX_PATH];
    int ret = resolve_path(path, win_path, sizeof(win_path));
    if (ret < 0) return ret;
    
    if (!RemoveDirectoryA(win_path)) {
        return win_to_errno(GetLastError());
    }
    return 0;
}

static int handle_rename(const char *from, const char *to)
{
    char win_from[MAX_PATH], win_to[MAX_PATH];
    int ret;
    
    ret = resolve_path(from, win_from, sizeof(win_from));
    if (ret < 0) return ret;
    
    ret = resolve_path(to, win_to, sizeof(win_to));
    if (ret < 0) return ret;
    
    if (!MoveFileA(win_from, win_to)) {
        return win_to_errno(GetLastError());
    }
    return 0;
}

static int handle_chmod(const char *path, uint32_t mode)
{
    char win_path[MAX_PATH];
    int ret = resolve_path(path, win_path, sizeof(win_path));
    if (ret < 0) return ret;
    
    /* Windows doesn't have full chmod, just read-only flag */
    DWORD attrs = GetFileAttributesA(win_path);
    if (attrs == INVALID_FILE_ATTRIBUTES) {
        return win_to_errno(GetLastError());
    }
    
    if (mode & 0200) {  /* user write */
        attrs &= ~FILE_ATTRIBUTE_READONLY;
    } else {
        attrs |= FILE_ATTRIBUTE_READONLY;
    }
    
    if (!SetFileAttributesA(win_path, attrs)) {
        return win_to_errno(GetLastError());
    }
    return 0;
}

static int handle_truncate(const char *path, uint64_t size)
{
    char win_path[MAX_PATH];
    int ret = resolve_path(path, win_path, sizeof(win_path));
    if (ret < 0) return ret;
    
    HANDLE h = CreateFileA(win_path, GENERIC_WRITE, FILE_SHARE_READ | FILE_SHARE_WRITE,
                           NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
    if (h == INVALID_HANDLE_VALUE) {
        return win_to_errno(GetLastError());
    }
    
    LARGE_INTEGER li;
    li.QuadPart = (LONGLONG)size;
    if (!SetFilePointerEx(h, li, NULL, FILE_BEGIN) || !SetEndOfFile(h)) {
        CloseHandle(h);
        return win_to_errno(GetLastError());
    }
    
    CloseHandle(h);
    return 0;
}

static int handle_utimens(const char *path, const void *times_data)
{
    char win_path[MAX_PATH];
    int ret = resolve_path(path, win_path, sizeof(win_path));
    if (ret < 0) return ret;
    
    const int64_t *times = times_data;
    
    /* Convert Unix timestamps to FILETIME */
    FILETIME atime = unix_to_filetime(times[0]);
    FILETIME mtime = unix_to_filetime(times[1]);
    
    HANDLE h = CreateFileA(win_path, FILE_WRITE_ATTRIBUTES,
                           FILE_SHARE_READ | FILE_SHARE_WRITE,
                           NULL, OPEN_EXISTING,
                           FILE_FLAG_BACKUP_SEMANTICS, NULL);
    if (h == INVALID_HANDLE_VALUE) {
        return win_to_errno(GetLastError());
    }
    
    if (!SetFileTime(h, NULL, &atime, &mtime)) {
        CloseHandle(h);
        return win_to_errno(GetLastError());
    }
    
    CloseHandle(h);
    return 0;
}

static int handle_statfs(const char *path, void **out_data, uint32_t *out_len)
{
    char win_path[MAX_PATH];
    int ret = resolve_path(path, win_path, sizeof(win_path));
    if (ret < 0) return ret;
    
    /* Get root of drive */
    char root[4] = "E:\\";
    root[0] = g_root[0];
    
    ULARGE_INTEGER free_bytes, total_bytes, avail_bytes;
    if (!GetDiskFreeSpaceExA(root, &avail_bytes, &total_bytes, &free_bytes)) {
        return win_to_errno(GetLastError());
    }
    
    WireStatvfs *ws = malloc(sizeof(WireStatvfs));
    if (!ws) return -ENOMEM;
    
    uint64_t bsize  = 4096;
    uint64_t blocks = total_bytes.QuadPart / bsize;
    uint64_t bfree  = free_bytes.QuadPart / bsize;
    uint64_t bavail = avail_bytes.QuadPart / bsize;
    
    ws->bsize  = htobe64(bsize);
    ws->blocks = htobe64(blocks);
    ws->bfree  = htobe64(bfree);
    ws->bavail = htobe64(bavail);
    ws->files  = htobe64(1000000);  /* arbitrary */
    ws->ffree  = htobe64(1000000);
    
    *out_data = ws;
    *out_len  = sizeof(WireStatvfs);
    return 0;
}

/* ════════════════════════════════════════════
   Request dispatcher
   ════════════════════════════════════════════ */

static void handle_client(SOCKET client_sock)
{
    char client_addr[64];
    struct sockaddr_in addr;
    int addr_len = sizeof(addr);
    getpeername(client_sock, (struct sockaddr*)&addr, &addr_len);
    inet_ntop(AF_INET, &addr.sin_addr, client_addr, sizeof(client_addr));
    
    LOG("Client connected: %s:%d", client_addr, ntohs(addr.sin_port));
    
    while (g_running) {
        ReqHeader req;
        if (recv_all(client_sock, &req, sizeof(req)) < 0) {
            break;  /* client disconnected */
        }
        
        /* Deserialize header */
        uint32_t magic = ntohl(req.magic);
        if (magic != PROTO_MAGIC) {
            ERR("Invalid magic from %s: 0x%08x", client_addr, magic);
            break;
        }
        
        req.op        = ntohl(req.op);
        req.offset    = be64toh(req.offset);
        req.size      = be64toh(req.size);
        req.flags     = ntohl(req.flags);
        req.path_len  = ntohl(req.path_len);
        req.path2_len = ntohl(req.path2_len);
        req.data_len  = ntohl(req.data_len);
        
        /* Sanity checks */
        if (req.path_len > MAX_PATH_LEN || req.path2_len > MAX_PATH_LEN ||
            req.data_len > MAX_DATA_LEN) {
            ERR("Request size overflow from %s", client_addr);
            break;
        }
        
        /* Receive path */
        char *path = malloc(req.path_len + 1);
        if (!path || recv_all(client_sock, path, req.path_len) < 0) {
            free(path);
            break;
        }
        path[req.path_len] = '\0';
        
        /* Receive path2 (for rename) */
        char *path2 = NULL;
        if (req.path2_len > 0) {
            path2 = malloc(req.path2_len + 1);
            if (!path2 || recv_all(client_sock, path2, req.path2_len) < 0) {
                free(path); free(path2);
                break;
            }
            path2[req.path2_len] = '\0';
        }
        
        /* Receive data (for write) */
        void *data = NULL;
        if (req.data_len > 0) {
            data = malloc(req.data_len);
            if (!data || recv_all(client_sock, data, req.data_len) < 0) {
                free(path); free(path2); free(data);
                break;
            }
        }
        
        /* Dispatch operation */
        int status = 0;
        void *resp_data = NULL;
        uint32_t resp_len = 0;
        
        switch (req.op) {
            case OP_GETATTR:
                status = handle_getattr(path, &resp_data, &resp_len);
                break;
            case OP_READDIR:
                status = handle_readdir(path, &resp_data, &resp_len);
                break;
            case OP_OPEN:
                status = handle_open(path, req.flags);
                break;
            case OP_READ:
                status = handle_read(path, req.offset, req.size, &resp_data, &resp_len);
                break;
            case OP_WRITE:
                status = handle_write(path, req.offset, req.size, data);
                break;
            case OP_CREATE:
                status = handle_create(path, req.flags);
                break;
            case OP_UNLINK:
                status = handle_unlink(path);
                break;
            case OP_MKDIR:
                status = handle_mkdir(path, req.flags);
                break;
            case OP_RMDIR:
                status = handle_rmdir(path);
                break;
            case OP_RENAME:
                status = handle_rename(path, path2);
                break;
            case OP_CHMOD:
                status = handle_chmod(path, req.flags);
                break;
            case OP_TRUNCATE:
                status = handle_truncate(path, req.size);
                break;
            case OP_UTIMENS:
                status = handle_utimens(path, data);
                break;
            case OP_STATFS:
                status = handle_statfs(path, &resp_data, &resp_len);
                break;
            case OP_MKNOD:
                status = handle_create(path, req.flags);
                break;
            case OP_RELEASE:
                status = 0;  /* no-op on Windows */
                break;
            default:
                ERR("Unknown operation %d from %s", req.op, client_addr);
                status = -ENOSYS;
        }
        
        /* Send response */
        RespHeader resp;
        resp.status   = htonl((uint32_t)status);
        resp.data_len = htonl(resp_len);
        
        if (send_all(client_sock, &resp, sizeof(resp)) < 0 ||
           (resp_len > 0 && send_all(client_sock, resp_data, resp_len) < 0)) {
            free(path); free(path2); free(data); free(resp_data);
            break;
        }
        
        free(path);
        free(path2);
        free(data);
        free(resp_data);
    }
    
    LOG("Client disconnected: %s", client_addr);
    closesocket(client_sock);
}

/* ════════════════════════════════════════════
   Main server loop
   ════════════════════════════════════════════ */

BOOL WINAPI console_handler(DWORD signal)
{
    if (signal == CTRL_C_EVENT || signal == CTRL_CLOSE_EVENT) {
        LOG("Shutdown signal received");
        g_running = 0;
        return TRUE;
    }
    return FALSE;
}

int main(int argc, char *argv[])
{
    WSADATA wsa;
    if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0) {
        ERR("WSAStartup failed: %d", WSAGetLastError());
        return 1;
    }
    
    /* Parse arguments */
    if (argc > 1) g_port = atoi(argv[1]);
    if (argc > 2) {
        strncpy(g_root, argv[2], sizeof(g_root) - 1);
        /* Ensure trailing backslash */
        size_t len = strlen(g_root);
        if (len > 0 && g_root[len-1] != '\\') {
            g_root[len] = '\\';
            g_root[len+1] = '\0';
        }
    }
    
    LOG("=======================================");
    LOG("  FUSE File Server for Windows");
    LOG("=======================================");
    LOG("Root directory: %s", g_root);
    LOG("Listening port: %d", g_port);
    LOG("Press Ctrl+C to stop");
    LOG("=======================================");
    
    /* Verify root exists */
    DWORD attrs = GetFileAttributesA(g_root);
    if (attrs == INVALID_FILE_ATTRIBUTES) {
        ERR("Root directory does not exist: %s", g_root);
        WSACleanup();
        return 1;
    }
    if (!(attrs & FILE_ATTRIBUTE_DIRECTORY)) {
        ERR("Root path is not a directory: %s", g_root);
        WSACleanup();
        return 1;
    }
    
    /* Setup Ctrl+C handler */
    SetConsoleCtrlHandler(console_handler, TRUE);
    
    /* Create listening socket */
    SOCKET listen_sock = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (listen_sock == INVALID_SOCKET) {
        ERR("socket() failed: %d", WSAGetLastError());
        WSACleanup();
        return 1;
    }
    
    /* Allow address reuse */
    int yes = 1;
    setsockopt(listen_sock, SOL_SOCKET, SO_REUSEADDR, (char*)&yes, sizeof(yes));
    
    /* Bind to port */
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(g_port);
    
    if (bind(listen_sock, (struct sockaddr*)&addr, sizeof(addr)) == SOCKET_ERROR) {
        ERR("bind() failed: %d", WSAGetLastError());
        closesocket(listen_sock);
        WSACleanup();
        return 1;
    }
    
    /* Listen for connections */
    if (listen(listen_sock, 5) == SOCKET_ERROR) {
        ERR("listen() failed: %d", WSAGetLastError());
        closesocket(listen_sock);
        WSACleanup();
        return 1;
    }
    
    LOG("Server ready - waiting for connections...");
    
    /* Accept loop */
    while (g_running) {
        /* Set timeout so we can check g_running periodically */
        fd_set read_fds;
        FD_ZERO(&read_fds);
        FD_SET(listen_sock, &read_fds);
        
        struct timeval tv;
        tv.tv_sec = 1;
        tv.tv_usec = 0;
        
        int sel = select(0, &read_fds, NULL, NULL, &tv);
        if (sel == SOCKET_ERROR) break;
        if (sel == 0) continue;  /* timeout */
        
        SOCKET client_sock = accept(listen_sock, NULL, NULL);
        if (client_sock == INVALID_SOCKET) {
            if (g_running) {
                ERR("accept() failed: %d", WSAGetLastError());
            }
            continue;
        }
        
        /* Handle client in new thread */
        HANDLE thread = CreateThread(NULL, 0,
            (LPTHREAD_START_ROUTINE)handle_client,
            (LPVOID)(uintptr_t)client_sock,
            0, NULL);
        
        if (thread) {
            CloseHandle(thread);  /* detach */
        } else {
            ERR("CreateThread failed: %lu", GetLastError());
            closesocket(client_sock);
        }
    }
    
    LOG("Shutting down...");
    closesocket(listen_sock);
    WSACleanup();
    return 0;
}
