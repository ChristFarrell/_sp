"""
fuse_bridge.py — Python bridge ke FUSE mount point

Semua operasi filesystem di-route ke /mnt/windows-e (atau path
yang dikonfigurasikan di FUSE_MOUNT), bukan langsung ke E:\.
Layer ini memastikan app.py tidak perlu tahu apakah backend-nya
adalah Windows drive, FUSE, atau apapun.

Changelog v2:
  - Expanded ALLOWED_EXTENSIONS — video, audio, office, fonts, code, dll
  - MIME_OVERRIDES — tipe yang jarang dikenal Flask/mimetypes
  - fuse_stream() — generator chunked, hindari load file GB ke RAM
  - fuse_read() — cap READ_MAX_BYTES; file besar → pakai fuse_stream
  - is_safe_path() — tambah cek null-byte dan path separator Windows
  - fuse_save() — validasi ekstensi sebelum tulis ke disk
"""

import os
import stat
import shutil
from datetime import datetime
from pathlib import Path
from typing import Generator

# ── Mount point dari fuse_client ──────────────────────────────
FUSE_MOUNT = "/mnt/windows-e"

# ── Chunk size untuk streaming file besar ─────────────────────
# Harus <= MAX_DATA_LEN (4 MB) di protocol.h; pakai 1 MB agar
# match dengan WRITE_BUFFER dan tidak terlalu banyak buffering.
STREAM_CHUNK = 1 << 20          # 1 MB per chunk

# ── Batas baca langsung ke memori (fuse_read) ─────────────────
READ_MAX_BYTES = 10 << 20       # 10 MB — file lebih besar → fuse_stream

# ── Ekstensi yang diizinkan ────────────────────────────────────
ALLOWED_EXTENSIONS: set[str] = {
    # Documents
    'txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'odt', 'ods', 'odp', 'rtf', 'epub',
    # Images
    'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'ico',
    'tif', 'tiff', 'heic', 'heif', 'avif',
    # Video  ← ditambah
    'mp4', 'mkv', 'mov', 'avi', 'wmv', 'flv', 'webm', 'm4v',
    'mpeg', 'mpg', '3gp', 'ts',
    # Audio  ← ditambah
    'mp3', 'ogg', 'wav', 'flac', 'm4a', 'aac', 'wma', 'opus',
    # Archives
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz',
    # Code / config
    'md', 'csv', 'log', 'json', 'xml', 'yaml', 'yml', 'toml',
    'ini', 'cfg', 'conf', 'env',
    'py', 'js', 'ts', 'jsx', 'tsx', 'css', 'scss', 'less',
    'html', 'htm', 'sh', 'bat', 'ps1', 'sql', 'r', 'ipynb',
    'c', 'cpp', 'h', 'java', 'kt', 'go', 'rs', 'rb', 'php',
    # Fonts
    'ttf', 'otf', 'woff', 'woff2',
}

# ── MIME overrides untuk tipe yang Flask/mimetypes tidak tahu ──
MIME_OVERRIDES: dict[str, str] = {
    'mkv':   'video/x-matroska',
    'ts':    'video/mp2t',
    'm4v':   'video/mp4',
    'opus':  'audio/ogg',
    'm4a':   'audio/mp4',
    'aac':   'audio/aac',
    'wma':   'audio/x-ms-wma',
    'flac':  'audio/flac',
    'heic':  'image/heic',
    'heif':  'image/heif',
    'avif':  'image/avif',
    'woff':  'font/woff',
    'woff2': 'font/woff2',
    'webm':  'video/webm',
    '7z':    'application/x-7z-compressed',
    'rar':   'application/vnd.rar',
}


# ═══════════════════════════════════════════════════════════════
# Path helpers
# ═══════════════════════════════════════════════════════════════

def mount_root() -> str:
    """Return FUSE mount root (realpath)."""
    return os.path.realpath(FUSE_MOUNT)


def resolve(rel_path: str) -> str:
    """
    Resolve relative POSIX path (dari browser) ke absolute path
    di dalam FUSE mount.  Raises PermissionError on traversal.
    """
    base   = mount_root()
    joined = os.path.join(base, rel_path.lstrip('/')) if rel_path else base
    real   = os.path.realpath(joined)
    # Pastikan real benar-benar di dalam base (termasuk base itu sendiri)
    if real != base and not real.startswith(base + os.sep):
        raise PermissionError(f"Path traversal terdeteksi: {rel_path!r}")
    return real


def is_safe_path(p: str) -> bool:
    """
    Cek path tidak mengandung karakter atau sequence berbahaya.
    Lebih ketat dari versi sebelumnya.
    """
    if p is None:
        return False
    danger = ['..', '\x00', '\\\\', '//', '\r', '\n']
    return not any(d in p for d in danger)


def allowed_file(filename: str) -> bool:
    """True jika ekstensi file ada di ALLOWED_EXTENSIONS."""
    return (
        '.' in filename and
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def mime_for(filename: str) -> str | None:
    """
    Return MIME type yang tepat untuk filename.
    Cek MIME_OVERRIDES dulu; fallback ke None (Flask akan detect sendiri).
    """
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    return MIME_OVERRIDES.get(ext)


# ═══════════════════════════════════════════════════════════════
# Stat helpers
# ═══════════════════════════════════════════════════════════════

def format_size(size: int) -> str:
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size < 1024.0:
            return f"{size:.2f} {unit}"
        size /= 1024.0
    return f"{size:.2f} PB"


def _stat_to_dict(name: str, full_path: str, rel_dir: str) -> dict:
    """Ubah os.stat result jadi dict JSON-serialisable."""
    st     = os.stat(full_path)
    is_dir = stat.S_ISDIR(st.st_mode)
    size   = 0 if is_dir else st.st_size
    rel    = os.path.join(rel_dir, name).replace('\\', '/').lstrip('/')
    return {
        'name':       name,
        'is_dir':     is_dir,
        'size':       size,
        'size_human': '-' if is_dir else format_size(size),
        'modified':   datetime.fromtimestamp(st.st_mtime).strftime('%Y-%m-%d %H:%M:%S'),
        'path':       rel,
        'mode':       oct(st.st_mode),
    }


# ═══════════════════════════════════════════════════════════════
# Filesystem operations — semua lewat FUSE mount
# ═══════════════════════════════════════════════════════════════

def fuse_listdir(rel_path: str) -> list[dict]:
    """
    List isi direktori.  Mengembalikan list dict per item,
    diurutkan folder dulu lalu file (alphabetical).
    """
    full = resolve(rel_path)
    if not os.path.isdir(full):
        raise NotADirectoryError(f"Bukan direktori: {rel_path!r}")

    items = []
    for name in os.listdir(full):
        try:
            items.append(_stat_to_dict(name, os.path.join(full, name), rel_path))
        except OSError:
            continue  # skip unreadable entries (e.g. broken symlink)

    items.sort(key=lambda x: (not x['is_dir'], x['name'].lower()))
    return items


def fuse_exists(rel_path: str) -> bool:
    try:
        return os.path.exists(resolve(rel_path))
    except PermissionError:
        return False


def fuse_is_dir(rel_path: str) -> bool:
    try:
        return os.path.isdir(resolve(rel_path))
    except PermissionError:
        return False


def fuse_mkdir(rel_path: str) -> None:
    """Buat direktori baru (tidak recursive)."""
    os.makedirs(resolve(rel_path), exist_ok=False)


def fuse_rmdir(rel_path: str) -> None:
    """Hapus direktori kosong."""
    os.rmdir(resolve(rel_path))


def fuse_unlink(rel_path: str) -> None:
    """Hapus satu file."""
    os.remove(resolve(rel_path))


def fuse_rename(rel_old: str, rel_new: str) -> None:
    """Rename / move file atau folder."""
    os.rename(resolve(rel_old), resolve(rel_new))


def fuse_read(rel_path: str, max_bytes: int = READ_MAX_BYTES) -> bytes:
    """
    Baca isi file ke bytes (untuk preview teks kecil).
    Gunakan fuse_stream() untuk file besar agar tidak OOM.
    """
    full = resolve(rel_path)
    size = os.path.getsize(full)
    if size > max_bytes:
        raise ValueError(
            f"File terlalu besar untuk dibaca langsung ({format_size(size)}). "
            f"Gunakan fuse_stream() untuk streaming."
        )
    with open(full, 'rb') as f:
        return f.read()


def fuse_stream(rel_path: str,
                start: int = 0,
                length: int | None = None) -> Generator[bytes, None, None]:
    """
    Generator chunked untuk streaming file besar.

    Dipakai oleh /api/preview dan /api/download agar:
    - Browser bisa mulai memutar video/audio sebelum download selesai
    - HTTP Range requests (seek) bisa dilayani dengan benar
    - RAM tidak habis untuk file GB

    Args:
        rel_path: path relatif di FUSE mount
        start:    byte offset awal (untuk Range requests)
        length:   jumlah byte yang diminta; None = sampai akhir file
    """
    full      = resolve(rel_path)
    remaining = length
    with open(full, 'rb') as f:
        f.seek(start)
        while True:
            to_read = STREAM_CHUNK
            if remaining is not None:
                if remaining <= 0:
                    break
                to_read = min(STREAM_CHUNK, remaining)
            chunk = f.read(to_read)
            if not chunk:
                break
            if remaining is not None:
                remaining -= len(chunk)
            yield chunk


def fuse_file_size(rel_path: str) -> int:
    """Return ukuran file dalam bytes."""
    return os.path.getsize(resolve(rel_path))


def fuse_full_path(rel_path: str) -> str:
    """
    Return absolute path di FUSE mount.
    Dipakai oleh Flask send_file() untuk streaming download/preview.
    """
    return resolve(rel_path)


def fuse_save(file_obj, rel_dir: str, filename: str) -> str:
    """
    Simpan file upload ke dalam direktori rel_dir.
    file_obj adalah werkzeug FileStorage.
    Mengembalikan rel path file yang disimpan.
    Raises ValueError jika ekstensi tidak diizinkan.
    """
    if not allowed_file(filename):
        raise ValueError(f"Ekstensi file tidak diizinkan: {filename!r}")
    dest_dir = resolve(rel_dir)
    if not os.path.isdir(dest_dir):
        raise NotADirectoryError(f"Direktori tujuan tidak ada: {rel_dir!r}")
    dest = os.path.join(dest_dir, filename)
    file_obj.save(dest)
    return os.path.join(rel_dir, filename).replace('\\', '/').lstrip('/')


def fuse_statvfs() -> dict:
    """
    Ambil info disk usage dari FUSE mount.
    Karena FUSE mount me-relay statvfs ke Windows, hasilnya
    merepresentasikan Drive E: yang sesungguhnya.
    """
    st = shutil.disk_usage(FUSE_MOUNT)
    total_gb = st.total / (1024 ** 3)
    used_gb  = st.used  / (1024 ** 3)
    free_gb  = st.free  / (1024 ** 3)
    percent  = (st.used / st.total * 100) if st.total > 0 else 0
    return {
        'total':       st.total,
        'used':        st.used,
        'free':        st.free,
        'total_human': f'{total_gb:.1f} GB',
        'used_human':  f'{used_gb:.1f} GB',
        'free_human':  f'{free_gb:.1f} GB',
        'percent':     round(percent, 1),
    }


def fuse_is_mounted() -> bool:
    """
    Cek apakah FUSE mount aktif.
    Heuristic: mount point ada, bisa di-stat, dan bukan
    direktori kosong yang sama dengan parent device.
    """
    try:
        mp  = os.stat(FUSE_MOUNT)
        par = os.stat(os.path.dirname(FUSE_MOUNT) or '/')
        return mp.st_dev != par.st_dev  # berbeda device → mounted
    except OSError:
        return False


def parent_path(rel_path: str) -> str | None:
    """Return parent rel_path, atau None kalau sudah di root."""
    if not rel_path or rel_path in ('', '.', '/'):
        return None
    p = str(Path(rel_path).parent)
    return '' if p in ('.', '/') else p.replace('\\', '/')
