# FileManager — FUSE over Tailscale

## Introduction

For this project, I'm used AI to help me to build and understand about the FILE FUSE system.
This system lets we to browse, upload, download, and manage files on a **Windows machine's Drive E:** from any browser on any device connected to the same **Tailscale** private network.

The entire pipeline is:

```
Browser  →  Flask (Ubuntu)  →  FUSE Mount  →  TCP/Tailscale  →  Windows Drive E:
```


## System Architecture

The system is composed of **four layers**, each with a distinct responsibility:

```
Layer 4 │  Browser (any device)
        │    HTTP requests: browse / upload / download / delete
        ▼
Layer 3 │  Flask Web Server  (app.py + fuse_bridge.py)   [Ubuntu]
        │    Authentication, OTP, routing, file API
        ▼
Layer 2 │  FUSE Filesystem   (fuse_client.c)             [Ubuntu]
        │    Intercepts Linux kernel syscalls
        │    Translates them to custom binary protocol
        │    Sends over TCP via Tailscale
        ▼
Layer 1 │  Windows File Server  (fs_server.exe)          [Windows]
        │    Receives binary protocol requests
        │    Executes Win32 API calls on Drive E:\
        │    Returns serialized results
```

## Data Flow — Step by Step

### Example: User clicks a folder in the browser

```
1. Browser
   GET /api/browse?path=Documents
   └─► app.py

2. app.py
   calls fuse_bridge.fuse_listdir("Documents")
   └─► resolves to os.listdir("/mnt/windows-e/Documents")

3. Linux kernel
   receives listdir syscall on /mnt/windows-e/Documents
   dispatches to fuse_client → nfs_readdir()

4. fuse_client (C)
   encodes ReqHeader { op=OP_READDIR, path="Documents\0" }
   sends 36-byte header + path string over TCP socket
   └─► Tailscale encrypted tunnel → Windows

5. fs_server.exe (Windows)
   receives binary header, validates magic
   calls FindFirstFile("E:\\Documents\\*")
   iterates all entries, builds null-separated name list
   sends RespHeader { status=0, data_len=N } + name list

6. fuse_client (C)
   receives response, returns filename list to kernel
   kernel delivers it to os.listdir() call in Python

7. fuse_bridge.py
   stat()s each entry for size and mtime
   (each stat = another FUSE round-trip to Windows)
   returns list of dicts

8. app.py
   serializes to JSON
   └─► Browser renders file list
```

### Example: User uploads a file

```
1. Browser
   POST /api/upload  (multipart, 256 KB chunks via XHR)
   └─► app.py

2. app.py
   opens destination path with open(dest, 'wb')
   reads upload stream in 256 KB chunks
   writes each chunk → fuse_bridge → /mnt/windows-e/path/file

3. Each write() syscall
   intercepted by kernel → fuse_client → nfs_write()
   encoded as ReqHeader { op=OP_WRITE, offset=N, size=256K }
   + 256 KB data payload → TCP → Windows

4. fs_server.exe
   WriteFile() to E:\path\file at given offset
   returns RespHeader { status=0 }

5. After all chunks:
   browser shows upload complete
   file exists on Drive E:\ on the Windows machine
```

## Component Explanation

### Windows Side — `fs_server.exe`

**Compiled from:** `fs_server.c` + `protocol.h`  
**Runs on:** Windows (MinGW/GCC)  
**Listens on:** TCP port `9000`

fs_server.exe acts as translator on Windows that handles file requests using a fast, private "binary language" instead of standard web code. When it receives a message from another computer, it decodes the information to understand what needs to be done—such as reading, writing, or deleting a file. After finish it, it will built-in Windows tools called Win32 APIs to carry out those actions directly on the system.

| Protocol Operation | Win32 API Called         |
|--------------------|--------------------------|
| `OP_GETATTR`       | `GetFileAttributesEx()`  |
| `OP_READDIR`       | `FindFirstFile()` / `FindNextFile()` |
| `OP_READ`          | `CreateFile()` + `ReadFile()` |
| `OP_WRITE`         | `CreateFile()` + `WriteFile()` |
| `OP_MKDIR`         | `CreateDirectoryW()`     |
| `OP_RMDIR`         | `RemoveDirectoryW()`     |
| `OP_UNLINK`        | `DeleteFileW()`          |
| `OP_RENAME`        | `MoveFileExW()`          |
| `OP_STATFS`        | `GetDiskFreeSpaceExW()`  |
| `OP_TRUNCATE`      | `SetEndOfFile()`         |

Each request is handled in its own **thread**. THe thread was very helpful, so multiple browser sessions can work simultaneously without blocking each other.
The server serializes results using the wire structs from `protocol.h` (`WireStat`, `WireStatvfs`) with all integers in network byte order (big-endian), so the Linux client can decode them correctly.

---

### Ubuntu Side — `fuse_client`

**Compiled from:** `fuse_client.c` + `protocol.h`  
**Runs on:** Ubuntu Linux  
**Mount point:** `/mnt/windows-e`

It uses the **FUSE (Filesystem in Userspace)** kernel interface to register itself as a filesystem driver. Once mounted, every file operation that any process on Ubuntu makes against `/mnt/windows-e` — whether it's `ls`, `cat`, `cp`, a Python `open()`, or a browser upload, it will gets intercepted by the Linux kernel and dispatched to `fuse_client`'s callback functions:

```c
static const struct fuse_operations nfs_ops = {
    .getattr  = nfs_getattr,   // called on every stat()
    .readdir  = nfs_readdir,   // called on every ls / listdir
    .read     = nfs_read,      // called on every file read
    .write    = nfs_write,     // called on every file write
    .create   = nfs_create,    // called on every new file
    .unlink   = nfs_unlink,    // called on every delete
    .mkdir    = nfs_mkdir,
    .rmdir    = nfs_rmdir,
    .rename   = nfs_rename,
    ...
};
```

Each callback encodes the request into a binary `ReqHeader`, sends it over the persistent TCP socket to `fs_server.exe` on Windows, waits for the `RespHeader` response, decodes it, and returns the result back to the kernel — which then delivers it to whichever process originally made the call.

**Feature in `fuse_client.c`:**

- **Single persistent TCP connection**. The socket stays open and is reused for all operations, protected by a mutex for thread safety.
- **Auto-reconnect** if the socket breaks (e.g. Tailscale drops briefly), the client automatically reconnects on the next operation without crashing the mount.
- **Wire encoding done once** the request header is encoded into a separate `wire` copy before sending. This means retries never accidentally double-encode the byte-swapped values, which was a critical bug that was fixed.

---

### The Bridge — `protocol.h`

**Used by:** both `fs_server.c` (Windows) and `fuse_client.c` (Ubuntu)

This header defines the shared language that both sides speak. It must be identical on both machines.

```
Request  →  [ ReqHeader (fixed 36 bytes) ] [ path string ] [ path2 string? ] [ data payload? ]
Response ←  [ RespHeader (fixed 8 bytes) ] [ data payload? ]
```

**`ReqHeader` fields (all network byte order):**

| Field        | Size    | Purpose                              |
|--------------|---------|--------------------------------------|
| `magic`      | 4 bytes | `0xF5E5D5C5` — sanity check          |
| `op`         | 4 bytes | Operation code (OP_READ, OP_WRITE…)  |
| `offset`     | 8 bytes | Byte offset for read/write           |
| `size`       | 8 bytes | Byte count for read/write            |
| `flags`      | 4 bytes | Open flags or mode bits              |
| `path_len`   | 4 bytes | Length of the path string following  |
| `path2_len`  | 4 bytes | Length of second path (for rename)   |
| `data_len`   | 4 bytes | Length of data payload (for write)   |

The `magic` field is checked on every request. If it doesn't match, the server knows the connection is corrupted and drops it.

Large integers (offset, size) are transmitted as **64-bit big-endian** using `htobe64`/`be64toh`. Since MinGW (the Windows GCC toolchain) does not ship `<endian.h>`, a polyfill is implemented directly using `htonl` — which is available everywhere via Winsock.

---

### Web Layer — Flask + Python

**Files:** `app.py`, `fuse_bridge.py`  
**Runs on:** Ubuntu, same machine as `fuse_client`

Once the system is set up, the folder `/mnt/windows-e` acts like a " private drive."

**`fuse_bridge.py`**:
- Resolves relative browser paths to absolute paths inside the FUSE mount
- Enforces path traversal protection (prevents `../../etc/passwd` attacks)
- Validates file extensions against an allowlist before upload
- Provides a streaming generator (`fuse_stream`) for large files. (Helpful for usage of RAM)

**`app.py`** handles:
- User authentication with **OTP sent to email**
- Session management
- All HTTP API endpoints: browse, upload, download, preview, rename, delete, copy, create folder
- Chunked upload (256 KB per chunk) so multi-GB files can be uploaded without timeouts
- Audit logging of all destructive operations

## Network Security — Tailscale

All TCP traffic between Ubuntu and Windows travels **exclusively through the Tailscale encrypted tunnel**.

```
Ubuntu (100.71.125.11)                    Windows (100.121.211.46)
         │                                          │
         │  WireGuard encrypted tunnel              │
         │◄────────────────────────────────────────►│
         │                                          │
         │  fs_server.exe only binds to 0.0.0.0     │
         │  but Windows Firewall + Tailscale ACL    │
         │  means only Tailscale peers can reach it │
```

The Flask web server (`app.py`) adds a second layer: OTP-based authentication before any file operation is allowed.

## File Structure

```
Windows machine:
└── D:\Farrell\tailFile\
    ├── fs_server.c       ← compile → fs_server.exe
    └── protocol.h        ← shared protocol definition

Ubuntu machine:
└── ~/tailFile/
    ├── fuse_client.c     ← compile → fuse_client binary
    ├── protocol.h        ← same file, needed at compile time
    ├── app.py            ← Flask web server
    ├── fuse_bridge.py    ← filesystem bridge layer
    └── templates/
        ├── index.html        ← main file manager UI
        ├── login.html        ← username entry page
        └── verify_otp.html   ← OTP verification page
```

## Setup & Running

### Windows — compile and start the server

```powershell
# In PowerShell, from the folder containing fs_server.c and protocol.h
gcc -Wall -o fs_server.exe fs_server.c -lws2_32

# Run (keep this window open)
.\fs_server.exe
```

The server will print the port it is listening on and log every incoming connection.

### Ubuntu — compile the FUSE client

```bash
# Install dependencies (once)
sudo apt install libfuse3-dev gcc pkg-config -y

# Compile
gcc -Wall -o fuse_client fuse_client.c \
    $(pkg-config --cflags --libs fuse3) -lpthread

# Create mount point (once)
sudo mkdir -p /mnt/windows-e

# Allow non-root users to access the mount (edit /etc/fuse.conf)
# Uncomment the line: user_allow_other
sudo nano /etc/fuse.conf
```

### Ubuntu — mount and run

```bash
# Terminal 1: start FUSE mount (keep open, or use -d for foreground debug)
sudo ./fuse_client /mnt/windows-e \
    -o server=100.121.211.46 \
    -o port=9000 \
    -o allow_other \
    -f

# Verify mount works
ls /mnt/windows-e    # should show contents of Windows E:\

# Terminal 2: install Python deps and start Flask
pip3 install flask
python3 app.py
```

### Access from browser

```
From Ubuntu itself:
  http://localhost:5000

From any device on the same Tailscale network:
  http://100.71.125.11:5000

Check your Ubuntu Tailscale IP with:
  tailscale ip
```