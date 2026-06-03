#define FUSE_USE_VERSION 31

#include <fuse.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <pthread.h>
#include <semaphore.h>
#include <sys/stat.h>
#include <sys/statvfs.h>
#include <time.h>
#include <stdint.h>
#include <stddef.h>

#include "protocol.h"

/* ════════════════════════════════════════════
   Connection pool configuration
   ════════════════════════════════════════════ */

#define POOL_MAX        8               /* maximum pool size (via -o pool=N)  */
#define POOL_DEFAULT    4               /* default pool size                   */
#define SOCK_TIMEOUT_S  30              /* SO_RCVTIMEO / SO_SNDTIMEO (seconds) */

typedef struct {
    int             fd;             /* socket fd; -1 = disconnected           */
    pthread_mutex_t mtx;            /* per-slot lock                          */
} ConnSlot;

/* ── Global config ── */
static char      g_server[256] = "100.121.211.46";
static int       g_port        = PORT;
static int       g_pool_size   = POOL_DEFAULT;

static ConnSlot  g_pool[POOL_MAX];
static sem_t     g_pool_sem;        /* counts available (unlocked) slots      */

/* ════════════════════════════════════════════
   Socket helpers
   ════════════════════════════════════════════ */

static int sock_connect(void)
{
    struct sockaddr_in addr;
    int fd = socket(AF_INET, SOCK_STREAM, 0);
    if (fd < 0) return -1;

    /* Resolve hostname or dotted-decimal */
    struct hostent *he = gethostbyname(g_server);
    if (!he) { close(fd); return -1; }

    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port   = htons(g_port);
    memcpy(&addr.sin_addr, he->h_addr_list[0], he->h_length);

    if (connect(fd, (struct sockaddr*)&addr, sizeof(addr)) < 0) {
        close(fd); return -1;
    }

    /* Keepalive — Tailscale idle connections */
    int yes = 1;
    setsockopt(fd, SOL_SOCKET, SO_KEEPALIVE, &yes, sizeof(yes));

    /* Timeout — prevent infinite hang on Windows-side crash */
    struct timeval tv = { .tv_sec = SOCK_TIMEOUT_S, .tv_usec = 0 };
    setsockopt(fd, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));
    setsockopt(fd, SOL_SOCKET, SO_SNDTIMEO, &tv, sizeof(tv));

    return fd;
}

/* Fully send/receive helpers */
static ssize_t send_all(int fd, const void *buf, size_t len)
{
    size_t sent = 0;
    while (sent < len) {
        ssize_t n = send(fd, (const char*)buf + sent, len - sent, MSG_NOSIGNAL);
        if (n <= 0) return -1;
        sent += n;
    }
    return (ssize_t)sent;
}

static ssize_t recv_all(int fd, void *buf, size_t len)
{
    size_t got = 0;
    while (got < len) {
        ssize_t n = recv(fd, (char*)buf + got, len - got, 0);
        if (n <= 0) return -1;
        got += n;
    }
    return (ssize_t)got;
}

/* ════════════════════════════════════════════
   Pool acquire / release
   ════════════════════════════════════════════ */

/*
 * Acquire a free connection slot.
 * Blocks until a slot is available (semaphore), then locks its mutex.
 * Reconnects the socket if it has been dropped.
 * Returns slot index on success, -1 on fatal error.
 */
static int pool_acquire(void)
{
    sem_wait(&g_pool_sem);

    for (int i = 0; i < g_pool_size; i++) {
        if (pthread_mutex_trylock(&g_pool[i].mtx) == 0) {
            /* Reconnect if needed */
            if (g_pool[i].fd < 0) {
                g_pool[i].fd = sock_connect();
                if (g_pool[i].fd < 0) {
                    fprintf(stderr, "[fuse_client] slot %d: cannot connect to %s:%d\n",
                            i, g_server, g_port);
                    pthread_mutex_unlock(&g_pool[i].mtx);
                    sem_post(&g_pool_sem);
                    return -1;
                }
                fprintf(stderr, "[fuse_client] slot %d: connected to %s:%d\n",
                        i, g_server, g_port);
            }
            return i;
        }
    }

    /* Should not reach here: semaphore ensures a slot is free */
    sem_post(&g_pool_sem);
    return -1;
}

static void pool_release(int slot)
{
    pthread_mutex_unlock(&g_pool[slot].mtx);
    sem_post(&g_pool_sem);
}

/* Mark a slot as broken (close socket, will reconnect on next use) */
static void pool_invalidate(int slot)
{
    if (g_pool[slot].fd >= 0) {
        close(g_pool[slot].fd);
        g_pool[slot].fd = -1;
    }
}

/* ════════════════════════════════════════════
   RPC core — uses connection pool
   ════════════════════════════════════════════ */

/*
 * do_rpc — send a request to the server, receive the response.
 *
 * Acquires a free slot from the pool, sends the encoded request,
 * reads the response.  On broken pipe, invalidates the slot and
 * retries once with a fresh connection.
 *
 * Returns: 0 or positive on success (status from server),
 *          negative -errno on local or remote error.
 * out_data (if non-NULL) must be free()'d by caller.
 */
static int do_rpc(ReqHeader *req,
                  const void *path,  uint32_t path_len,
                  const void *path2, uint32_t path2_len,
                  const void *data,  uint32_t data_len,
                  void **out_data,   uint32_t *out_len)
{
    /* Encode header into wire format once */
    ReqHeader wire;
    wire.magic     = htonl(PROTO_MAGIC);
    wire.op        = htonl(req->op);
    wire.offset    = htobe64(req->offset);
    wire.size      = htobe64(req->size);
    wire.flags     = htonl(req->flags);
    wire.path_len  = htonl(path_len);
    wire.path2_len = htonl(path2_len);
    wire.data_len  = htonl(data_len);

    if (out_data) *out_data = NULL;
    if (out_len)  *out_len  = 0;

    int retried = 0;
retry:;
    int slot = pool_acquire();
    if (slot < 0) return -EIO;

    int fd = g_pool[slot].fd;

    /* Send request */
    int send_ok =
        send_all(fd, &wire, sizeof(wire))  >= 0 &&
        send_all(fd, path, path_len)       >= 0 &&
        (!path2_len || send_all(fd, path2, path2_len) >= 0) &&
        (!data_len  || send_all(fd, data,  data_len)  >= 0);

    if (!send_ok) {
        pool_invalidate(slot);
        pool_release(slot);
        if (!retried) { retried = 1; goto retry; }
        return -EIO;
    }

    /* Receive response header */
    RespHeader resp;
    if (recv_all(fd, &resp, sizeof(resp)) < 0) {
        pool_invalidate(slot);
        pool_release(slot);
        if (!retried) { retried = 1; goto retry; }
        return -EIO;
    }

    resp.status   = (int32_t)ntohl((uint32_t)resp.status);
    resp.data_len = ntohl(resp.data_len);

    int ret = resp.status;

    /* Receive response payload */
    if (resp.data_len > 0) {
        void *buf = malloc(resp.data_len);
        if (!buf) {
            pool_invalidate(slot);
            pool_release(slot);
            return -ENOMEM;
        }
        if (recv_all(fd, buf, resp.data_len) < 0) {
            free(buf);
            pool_invalidate(slot);
            pool_release(slot);
            if (!retried) { retried = 1; goto retry; }
            return -EIO;
        }
        if (out_data) *out_data = buf;
        else          free(buf);
        if (out_len)  *out_len  = resp.data_len;
    }

    pool_release(slot);
    return ret;
}

/* ════════════════════════════════════════════
   FUSE operation implementations
   ════════════════════════════════════════════ */

static int nfs_getattr(const char *path, struct stat *st,
                       struct fuse_file_info *fi)
{
    (void)fi;
    ReqHeader req = { .op = OP_GETATTR };
    void     *data = NULL;
    uint32_t  dlen = 0;
    int ret = do_rpc(&req, path, strlen(path)+1, "", 0, NULL, 0, &data, &dlen);
    if (ret < 0) return ret;

    if (dlen < sizeof(WireStat)) { free(data); return -EIO; }
    WireStat *ws = data;

    memset(st, 0, sizeof(*st));
    st->st_mode    = ntohl(ws->mode);
    st->st_nlink   = ntohl(ws->nlink);
    st->st_size    = (off_t)be64toh(ws->size);
    st->st_atime   = (time_t)be64toh((uint64_t)ws->atime);
    st->st_mtime   = (time_t)be64toh((uint64_t)ws->mtime);
    st->st_ctime   = (time_t)be64toh((uint64_t)ws->ctime);
    st->st_blocks  = (blkcnt_t)be64toh(ws->blocks);
    st->st_blksize = 4096;
    free(data);
    return 0;
}

static int nfs_readdir(const char *path, void *buf,
                       fuse_fill_dir_t filler, off_t offset,
                       struct fuse_file_info *fi,
                       enum fuse_readdir_flags flags)
{
    (void)offset; (void)fi; (void)flags;
    ReqHeader req = { .op = OP_READDIR };
    void     *data = NULL;
    uint32_t  dlen = 0;
    int ret = do_rpc(&req, path, strlen(path)+1, "", 0, NULL, 0, &data, &dlen);
    if (ret < 0) return ret;

    filler(buf, ".",  NULL, 0, 0);
    filler(buf, "..", NULL, 0, 0);

    char *p   = data;
    char *end = (char*)data + dlen;
    while (p < end) {
        size_t len = strlen(p);
        if (len) filler(buf, p, NULL, 0, 0);
        p += len + 1;
    }
    free(data);
    return 0;
}

static int nfs_open(const char *path, struct fuse_file_info *fi)
{
    ReqHeader req = { .op = OP_OPEN, .flags = (uint32_t)fi->flags };
    return do_rpc(&req, path, strlen(path)+1, "", 0, NULL, 0, NULL, NULL);
}

static int nfs_read(const char *path, char *buf, size_t size, off_t offset,
                    struct fuse_file_info *fi)
{
    (void)fi;
    ReqHeader req = { .op = OP_READ, .offset = (uint64_t)offset,
                      .size = (uint64_t)size };
    void     *data = NULL;
    uint32_t  dlen = 0;
    int ret = do_rpc(&req, path, strlen(path)+1, "", 0, NULL, 0, &data, &dlen);
    if (ret < 0) return ret;
    memcpy(buf, data, dlen);
    free(data);
    return (int)dlen;
}

static int nfs_write(const char *path, const char *buf, size_t size,
                     off_t offset, struct fuse_file_info *fi)
{
    (void)fi;
    ReqHeader req = { .op = OP_WRITE, .offset = (uint64_t)offset,
                      .size = (uint64_t)size };
    int ret = do_rpc(&req, path, strlen(path)+1, "", 0, buf, (uint32_t)size,
                     NULL, NULL);
    return ret < 0 ? ret : (int)size;
}

static int nfs_create(const char *path, mode_t mode,
                      struct fuse_file_info *fi)
{
    (void)fi;
    ReqHeader req = { .op = OP_CREATE, .flags = (uint32_t)mode };
    return do_rpc(&req, path, strlen(path)+1, "", 0, NULL, 0, NULL, NULL);
}

static int nfs_unlink(const char *path)
{
    ReqHeader req = { .op = OP_UNLINK };
    return do_rpc(&req, path, strlen(path)+1, "", 0, NULL, 0, NULL, NULL);
}

static int nfs_mkdir(const char *path, mode_t mode)
{
    ReqHeader req = { .op = OP_MKDIR, .flags = (uint32_t)mode };
    return do_rpc(&req, path, strlen(path)+1, "", 0, NULL, 0, NULL, NULL);
}

static int nfs_rmdir(const char *path)
{
    ReqHeader req = { .op = OP_RMDIR };
    return do_rpc(&req, path, strlen(path)+1, "", 0, NULL, 0, NULL, NULL);
}

static int nfs_rename(const char *from, const char *to, unsigned int flags)
{
    (void)flags;
    ReqHeader req = { .op = OP_RENAME };
    return do_rpc(&req,
                  from, strlen(from)+1,
                  to,   strlen(to)+1,
                  NULL, 0, NULL, NULL);
}

static int nfs_chmod(const char *path, mode_t mode,
                     struct fuse_file_info *fi)
{
    (void)fi;
    ReqHeader req = { .op = OP_CHMOD, .flags = (uint32_t)mode };
    return do_rpc(&req, path, strlen(path)+1, "", 0, NULL, 0, NULL, NULL);
}

static int nfs_truncate(const char *path, off_t size,
                        struct fuse_file_info *fi)
{
    (void)fi;
    ReqHeader req = { .op = OP_TRUNCATE, .size = (uint64_t)size };
    return do_rpc(&req, path, strlen(path)+1, "", 0, NULL, 0, NULL, NULL);
}

static int nfs_utimens(const char *path, const struct timespec tv[2],
                       struct fuse_file_info *fi)
{
    (void)fi;
    int64_t times[2] = { (int64_t)tv[0].tv_sec, (int64_t)tv[1].tv_sec };
    ReqHeader req = { .op = OP_UTIMENS };
    return do_rpc(&req, path, strlen(path)+1, "", 0,
                  times, sizeof(times), NULL, NULL);
}

static int nfs_statfs(const char *path, struct statvfs *st)
{
    ReqHeader req = { .op = OP_STATFS };
    void     *data = NULL;
    uint32_t  dlen = 0;
    int ret = do_rpc(&req, path, strlen(path)+1, "", 0, NULL, 0, &data, &dlen);
    if (ret < 0) return ret;
    if (dlen < sizeof(WireStatvfs)) { free(data); return -EIO; }

    WireStatvfs *ws = data;
    memset(st, 0, sizeof(*st));
    st->f_bsize   = (unsigned long)be64toh(ws->bsize);
    st->f_blocks  = (fsblkcnt_t)  be64toh(ws->blocks);
    st->f_bfree   = (fsblkcnt_t)  be64toh(ws->bfree);
    st->f_bavail  = (fsblkcnt_t)  be64toh(ws->bavail);
    st->f_files   = (fsfilcnt_t)  be64toh(ws->files);
    st->f_ffree   = (fsfilcnt_t)  be64toh(ws->ffree);
    st->f_namemax = 255;
    free(data);
    return 0;
}

static int nfs_mknod(const char *path, mode_t mode, dev_t dev)
{
    (void)dev;
    ReqHeader req = { .op = OP_MKNOD, .flags = (uint32_t)mode };
    return do_rpc(&req, path, strlen(path)+1, "", 0, NULL, 0, NULL, NULL);
}

static int nfs_release(const char *path, struct fuse_file_info *fi)
{
    (void)fi;
    ReqHeader req = { .op = OP_RELEASE };
    return do_rpc(&req, path, strlen(path)+1, "", 0, NULL, 0, NULL, NULL);
}

/* ── NEW: Symlink support (OP_SYMLINK / OP_READLINK) ── */

static int nfs_symlink(const char *target, const char *linkpath)
{
    /*
     * target   = konten symlink (path yang dituju)
     * linkpath = path symlink yang akan dibuat
     *
     * Kita encode: path = linkpath, path2 = target
     * (server membuat CreateSymbolicLinkA(linkpath, target))
     */
    ReqHeader req = { .op = OP_SYMLINK };
    return do_rpc(&req,
                  linkpath, strlen(linkpath)+1,
                  target,   strlen(target)+1,
                  NULL, 0, NULL, NULL);
}

static int nfs_readlink(const char *path, char *buf, size_t size)
{
    ReqHeader req = { .op = OP_READLINK };
    void     *data = NULL;
    uint32_t  dlen = 0;
    int ret = do_rpc(&req, path, strlen(path)+1, "", 0, NULL, 0, &data, &dlen);
    if (ret < 0) return ret;

    size_t copy = dlen < size - 1 ? dlen : size - 1;
    memcpy(buf, data, copy);
    buf[copy] = '\0';
    free(data);
    return 0;
}

/* ── NEW: fsync (OP_FSYNC) ── */

static int nfs_fsync(const char *path, int datasync,
                     struct fuse_file_info *fi)
{
    (void)datasync; (void)fi;
    ReqHeader req = { .op = OP_FSYNC };
    return do_rpc(&req, path, strlen(path)+1, "", 0, NULL, 0, NULL, NULL);
}

/* ════════════════════════════════════════════
   FUSE operations table
   ════════════════════════════════════════════ */
static const struct fuse_operations nfs_ops = {
    .getattr  = nfs_getattr,
    .readdir  = nfs_readdir,
    .open     = nfs_open,
    .read     = nfs_read,
    .write    = nfs_write,
    .create   = nfs_create,
    .unlink   = nfs_unlink,
    .mkdir    = nfs_mkdir,
    .rmdir    = nfs_rmdir,
    .rename   = nfs_rename,
    .chmod    = nfs_chmod,
    .truncate = nfs_truncate,
    .utimens  = nfs_utimens,
    .statfs   = nfs_statfs,
    .mknod    = nfs_mknod,
    .release  = nfs_release,
    .symlink  = nfs_symlink,
    .readlink = nfs_readlink,
    .fsync    = nfs_fsync,
};

struct nfs_options {
    const char *server;
    int         port;
    int         pool;
    int         show_help;
};

#define OPT(t, p, v) { t, offsetof(struct nfs_options, p), v }
static const struct fuse_opt nfs_opts[] = {
    OPT("server=%s", server,    0),
    OPT("port=%d",   port,      0),
    OPT("pool=%d",   pool,      0),
    OPT("-h",        show_help, 1),
    OPT("--help",    show_help, 1),
    FUSE_OPT_END
};

static void show_help_msg(const char *progname)
{
    fprintf(stderr,
        "Usage: %s <mountpoint> [options]\n\n"
        "FUSE NFS Client options:\n"
        "    -o server=HOST   server IP or hostname (default: 127.0.0.1)\n"
        "    -o port=PORT     server port           (default: %d)\n"
        "    -o pool=N        connection pool size   (default: %d, max: %d)\n\n",
        progname, PORT, POOL_DEFAULT, POOL_MAX);
}

int main(int argc, char *argv[])
{
    struct fuse_args args = FUSE_ARGS_INIT(argc, argv);
    struct nfs_options opts = { .server = NULL, .port = PORT,
                                .pool = POOL_DEFAULT };

    if (fuse_opt_parse(&args, &opts, nfs_opts, NULL) == -1)
        return 1;

    if (opts.show_help) {
        show_help_msg(argv[0]);
        fuse_opt_add_arg(&args, "--help");
        args.argv[0][0] = '\0';
        return fuse_main(args.argc, args.argv, &nfs_ops, NULL);
    }

    /* Apply parsed options */
    if (opts.server)
        strncpy(g_server, opts.server, sizeof(g_server)-1);
    g_port = opts.port;

    /* Clamp pool size */
    g_pool_size = opts.pool;
    if (g_pool_size < 1)        g_pool_size = 1;
    if (g_pool_size > POOL_MAX) g_pool_size = POOL_MAX;

    /* Initialise pool */
    sem_init(&g_pool_sem, 0, g_pool_size);
    for (int i = 0; i < g_pool_size; i++) {
        g_pool[i].fd = -1;
        pthread_mutex_init(&g_pool[i].mtx, NULL);
    }

    /* Eager connect on all slots to fail fast on wrong IP */
    int connected = 0;
    for (int i = 0; i < g_pool_size; i++) {
        g_pool[i].fd = sock_connect();
        if (g_pool[i].fd >= 0) {
            connected++;
            fprintf(stderr, "[fuse_client] slot %d: connected to %s:%d\n",
                    i, g_server, g_port);
        } else {
            fprintf(stderr, "[fuse_client] slot %d: WARNING — initial connect failed\n", i);
        }
    }

    if (connected == 0) {
        fprintf(stderr,
            "[fuse_client] ERROR: cannot connect to %s:%d on any slot.\n"
            "              Is fs_server.exe running on Windows?\n",
            g_server, g_port);
        return 1;
    }

    fprintf(stderr,
        "[fuse_client] pool ready: %d/%d slots connected — mounting...\n",
        connected, g_pool_size);

    return fuse_main(args.argc, args.argv, &nfs_ops, NULL);
}
