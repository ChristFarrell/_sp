"""
demos/demo_std_fds.py  —  Interactive stdin/stdout/stderr Simulator
"""
import os, sys
from utils.printer import info, ok, code, step, prompt, pause

STDIN, STDOUT, STDERR = 0, 1, 2


def run():
    print("""
  ╔═══════════════════════════════════════════════════════╗
  ║   CONCEPT: stdin(0) · stdout(1) · stderr(2)          ║
  ╚═══════════════════════════════════════════════════════╝

  Every process gets 3 file descriptors for FREE at startup:

  ┌────┬──────────┬───────────────────────────────────┐
  │ fd │  name    │  purpose                          │
  ├────┼──────────┼───────────────────────────────────┤
  │  0 │  stdin   │  input  (keyboard by default)     │
  │  1 │  stdout  │  output (terminal by default)     │
  │  2 │  stderr  │  errors (terminal by default)     │
  └────┴──────────┴───────────────────────────────────┘

  They are just fd NUMBERS — nothing special about them.
  That means dup2() can point them anywhere you want!
""")
    pause()

    # ── Step 1 ──────────────────────────────────────────────
    step(1, "Check what fd 0, 1, 2 are in your process. Type:")
    print("       os.fstat(0)")
    prompt("os.fstat(0)", hint="fstat() returns info about an open fd")

    print("\n  Results:")
    names = {0: "stdin ", 1: "stdout", 2: "stderr"}
    for fd in [0, 1, 2]:
        try:
            stat = os.fstat(fd)
            print(f"    fd {fd}  ({names[fd]})  →  OPEN  [inode={stat.st_ino}]")
        except OSError:
            print(f"    fd {fd}  ({names[fd]})  →  CLOSED")

    # ── Step 2 ──────────────────────────────────────────────
    step(2, "Write to stdout (fd=1) directly. Type:")
    print('       os.write(1, b"Hello stdout!\\n")')
    prompt('os.write(1, b"Hello stdout!\\n")', hint="fd 1 = stdout = terminal output")

    os.write(STDOUT, b"  Hello stdout!\n")

    # ── Step 3 ──────────────────────────────────────────────
    step(3, "Write to stderr (fd=2) directly. Type:")
    print('       os.write(2, b"Warning: something went wrong!\\n")')
    prompt('os.write(2, b"Warning: something went wrong!\\n")', hint="fd 2 = stderr = error output")

    os.write(STDERR, b"  Warning: something went wrong!\n")

    # ── Step 4 ──────────────────────────────────────────────
    step(4, "Now try typing something — it reads from stdin (fd=0). Type:")
    print("       os.read(0, 64)")
    prompt("os.read(0, 64)", hint="fd 0 = stdin = keyboard input")

    print("  \033[90m  Now type anything and press ENTER:\033[0m  ", end="", flush=True)
    try:
        data = os.read(0, 64)
        ok(f"You typed: {data!r}  ({len(data)} bytes read from fd=0)")
    except Exception as e:
        info(f"Read skipped: {e}")

    print("""
  ┌──────────────────────────────────────────────────────┐
  │  Python equivalents:                                 │
  │                                                      │
  │  print("x")            →  os.write(1, b"x\\n")      │
  │  print("x",            │                            │
  │    file=sys.stderr)    →  os.write(2, b"x\\n")      │
  │  input()               →  os.read(0, n)             │
  │                                                      │
  │  Shell redirects work because of these fd numbers:  │
  │    prog > out.txt      →  fd 1 redirected to file   │
  │    prog 2> err.txt     →  fd 2 redirected to file   │
  │    prog < in.txt       →  fd 0 redirected from file │
  └──────────────────────────────────────────────────────┘
""")
