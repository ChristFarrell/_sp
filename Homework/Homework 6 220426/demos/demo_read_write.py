"""
demos/demo_read_write.py  —  Interactive read()/write() Simulator
"""
import os, tempfile
from utils.printer import info, ok, code, step, prompt, pause

PATH = os.path.join(tempfile.gettempdir(), "sysprog_rw.txt")


def run():
    print("""
  ╔═══════════════════════════════════════════════════╗
  ║   CONCEPT: read() / write()  —  Low-level I/O   ║
  ╚═══════════════════════════════════════════════════╝

  read() and write() move raw BYTES through a file descriptor.

  os.write(fd, b"data")  →  sends bytes INTO the fd
  os.read(fd, n)         →  pulls UP TO n bytes FROM the fd

  IMPORTANT: always use BYTES, not strings!
    "hello"           ← str   (won't work)
    b"hello"          ← bytes (works!)
    "hello".encode()  ← convert str → bytes (works!)
    data.decode()     ← convert bytes → str (for display)
""")
    pause()

    # ── Step 1: open ────────────────────────────────────────
    step(1, "Open a file for writing. Type:")
    print("       os.open('rw.txt', os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)")
    prompt("os.open('rw.txt', os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)",
           hint="same as before — get an fd number back")

    fd = os.open(PATH, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)
    ok(f"Got fd = {fd}")

    # ── Step 2: write ───────────────────────────────────────
    step(2, "Write bytes to the file. Type:")
    print('       os.write(fd, b"Hello, Linux!\\n")')
    prompt('os.write(fd, b"Hello, Linux!\\n")', hint="note the b prefix — must be bytes!")

    n = os.write(fd, b"Hello, Linux!\n")
    ok(f"Wrote {n} bytes to fd={fd}")

    lines = [b"Line 2: read/write is powerful\n", b"Line 3: always use bytes\n"]
    for line in lines:
        os.write(fd, line)
    os.close(fd)
    info("Wrote 3 lines total. File closed.\n")

    # ── Step 3: read ────────────────────────────────────────
    step(3, "Open the file for reading, then read it. Type:")
    print("       os.read(fd, 1024)")
    prompt("os.read(fd, 1024)", hint="1024 = max bytes to read at once")

    fd2 = os.open(PATH, os.O_RDONLY)
    content = b""
    while True:
        chunk = os.read(fd2, 32)
        if not chunk:
            break
        content += chunk
    os.close(fd2)

    print("\n  File contents (decoded):\n")
    for line in content.decode().splitlines():
        print(f"    {line}")

    # ── Step 4: write to stdout directly ────────────────────
    step(4, "Write directly to stdout (fd=1) without print(). Type:")
    print('       os.write(1, b"Direct to terminal!\\n")')
    prompt('os.write(1, b"Direct to terminal!\\n")', hint="fd 1 is always stdout")

    os.write(1, b"  >>> Direct to terminal!\n")

    print("""
  ┌──────────────────────────────────────────────┐
  │  KEY RULES                                   │
  │                                              │
  │  Always use b"..." or .encode() for bytes    │
  │  read() in a loop — may return partial data  │
  │  read() returns b'' at end of file           │
  │  write() to fd=1 = same as print()           │
  └──────────────────────────────────────────────┘
""")
