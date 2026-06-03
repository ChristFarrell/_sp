#ifndef PROTOCOL_H
#define PROTOCOL_H

#include <stdint.h>

#define PORT            9000
#define MAX_PATH_LEN    4096
#define MAX_DATA_LEN    (4 << 20)   /* 4 MB per chunk (was 1 MB) - untuk PDF/video besar */
#define PROTO_MAGIC     0xF5E5D5C5U
#define PROTO_VERSION   2           /* Protocol version */

/* ── Operation codes ── */
typedef enum {
    OP_GETATTR   = 1,
    OP_READDIR   = 2,
    OP_READ      = 3,
    OP_WRITE     = 4,
    OP_CREATE    = 5,
    OP_UNLINK    = 6,
    OP_MKDIR     = 7,
    OP_RMDIR     = 8,   
    OP_RENAME    = 9,
    OP_CHMOD     = 10,
    OP_TRUNCATE  = 11,
    OP_UTIMENS   = 12,
    OP_STATFS    = 13,
    OP_OPEN      = 14,
    OP_RELEASE   = 15,
    OP_MKNOD     = 16,
    OP_SYMLINK   = 17,  
    OP_READLINK  = 18,  
    OP_FSYNC     = 19,  
} OpCode;

/* ── Request header (fixed size, sent before variable payload) ── */
typedef struct __attribute__((packed)) {
    uint32_t magic;         /* PROTO_MAGIC                    */
    uint32_t op;            /* OpCode                         */
    uint64_t offset;        /* for READ/WRITE: byte offset    */
    uint64_t size;          /* for READ/WRITE: byte count     */
    uint32_t flags;         /* open flags / mode bits         */
    uint32_t path_len;      /* length of path string (bytes)  */
    uint32_t path2_len;     /* length of second path (RENAME) */
    uint32_t data_len;      /* length of data payload (WRITE) */
} ReqHeader;

/* ── Response header ── */
typedef struct __attribute__((packed)) {
    int32_t  status;        /* 0 = ok, negative = -errno      */
    uint32_t data_len;      /* bytes following this header    */
} RespHeader;

/* ── Serialised stat (fits both Windows & Linux) ── */
typedef struct __attribute__((packed)) {
    uint32_t mode;          /* protection bits                */
    uint32_t nlink;
    uint64_t size;
    int64_t  atime;         /* seconds since epoch            */
    int64_t  mtime;
    int64_t  ctime;
    uint64_t blocks;
} WireStat;

/* ── Serialised statvfs ── */
typedef struct __attribute__((packed)) {
    uint64_t bsize;
    uint64_t blocks;
    uint64_t bfree;
    uint64_t bavail;
    uint64_t files;
    uint64_t ffree;
} WireStatvfs;

/* ── Performance optimization hints ── */
#define READAHEAD_SIZE  (256 * 1024)  /* 256 KB readahead for sequential reads */
#define WRITE_BUFFER    (1 << 20)     /* 1 MB write buffer before flush */
#define ATTR_CACHE_TTL  3              /* Attribute cache TTL in seconds */

/* ── Feature flags (for future capability negotiation) ── */
#define FEATURE_COMPRESSION  (1 << 0)  /* Support gzip compression */
#define FEATURE_ENCRYPTION   (1 << 1)  /* Support encryption */
#define FEATURE_ASYNC_WRITE  (1 << 2)  /* Support async write buffer */
#define FEATURE_BATCH_OPS    (1 << 3)  /* Support batched operations */

#endif /* PROTOCOL_H */
