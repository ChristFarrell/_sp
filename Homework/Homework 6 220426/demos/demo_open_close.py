"""
demos/demo_open_close.py  —  Interactive open()/close() Simulator
"""
import os, tempfile
from utils.printer import info, ok, code, step, prompt, pause

PATH = os.path.join(tempfile.gettempdir(), "sysprog_demo.txt")


def run():
    print("""
  ╔═══════════════════════════════════════════════════╗
  ║   CONCEPT: open() / close()  —  File Descriptors ║
  ╚═══════════════════════════════════════════════════╝

  Every file/device/pipe is accessed through a
  FILE DESCRIPTOR (fd) — just a small integer.

  fd table in every process:
  ┌────┬──────────────────────────────┐
  │ fd │  what it points to          │
  ├────┼──────────────────────────────┤
  │  0 │  stdin  (keyboard)          │
  │  1 │  stdout (terminal)          │
  │  2 │  stderr (terminal)          │
  │  3 │  ← YOUR file goes here      │
  │  4 │  (next one, if any)         │
  └────┴──────────────────────────────┘

  os.open()  returns the fd number.
  os.close() releases it.
""")
    pause()

    # ── Step 1 ──────────────────────────────────────────────
    step(1, "Open a file for writing (create it if not exists). Type:")
    print("       os.open('file.txt', os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)")
    prompt("os.open('file.txt', os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)",
           hint="flags combined with | (OR). 0o644 = file permissions")

    fd = os.open(PATH, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)
    ok(f"File opened!  fd = {fd}  (kernel gave us this number)")

    # ── Step 2 ──────────────────────────────────────────────
    step(2, "Close the file when done. Type:")
    print("       os.close(fd)")
    prompt("os.close(fd)", hint="always close! leaked fds cause bugs")

    os.close(fd)
    ok(f"fd {fd} is now closed and freed.")

    # ── Step 3 ──────────────────────────────────────────────
    step(3, "Open the same file again for reading. Type:")
    print("       os.open('file.txt', os.O_RDONLY)")
    prompt("os.open('file.txt', os.O_RDONLY)", hint="O_RDONLY = read only, no permission mode needed")

    fd2 = os.open(PATH, os.O_RDONLY)
    ok(f"File opened for reading!  fd = {fd2}")
    os.close(fd2)

    # ── Show fd table ────────────────────────────────────────
    print("\n  Current fd table of this process:")
    names = {0: "stdin", 1: "stdout", 2: "stderr"}
    for n in range(6):
        try:
            os.fstat(n)
            print(f"    fd {n}  →  {names.get(n, 'open')}")
        except OSError:
            print(f"    fd {n}  →  (closed / free)")

    print("""
  ┌────────────────────────────────────────────┐
  │  COMMON FLAGS                              │
  │                                            │
  │  O_RDONLY  — read only                     │
  │  O_WRONLY  — write only                    │
  │  O_RDWR   — read + write                  │
  │  O_CREAT  — create if not exists           │
  │  O_TRUNC  — clear file on open             │
  │  O_APPEND — always write at end            │
  └────────────────────────────────────────────┘
""")
