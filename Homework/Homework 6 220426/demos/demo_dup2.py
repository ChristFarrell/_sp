"""
demos/demo_dup2.py  —  Interactive dup2() Simulator
"""
import os, sys, tempfile
from utils.printer import info, ok, code, step, prompt, pause

PATH_OUT = os.path.join(tempfile.gettempdir(), "sysprog_dup2_stdout.txt")
PATH_ERR = os.path.join(tempfile.gettempdir(), "sysprog_dup2_stderr.txt")


def run():
    print("""
  ╔═══════════════════════════════════════════════════╗
  ║   CONCEPT: dup2()  —  Redirect File Descriptors  ║
  ╚═══════════════════════════════════════════════════╝

  dup2(old_fd, new_fd) makes new_fd point to same place as old_fd.
  If new_fd was open, it gets closed automatically first.

  Before dup2(3, 1):          After dup2(3, 1):
  ┌────┬───────────┐           ┌────┬───────────┐
  │ 1  │ terminal  │    →      │ 1  │ file.txt  │ ← redirected!
  │ 3  │ file.txt  │           │ 3  │ file.txt  │
  └────┴───────────┘           └────┴───────────┘

  Now ANY write to fd=1 (stdout) goes to file.txt!
  This is exactly how the shell does:   prog > output.txt
""")
    pause()

    # ── Step 1 ──────────────────────────────────────────────
    step(1, "Backup stdout first so we can restore it later. Type:")
    print("       stdout_backup = os.dup(1)")
    prompt("stdout_backup = os.dup(1)", hint="os.dup() copies fd to a new slot — save it!")

    stdout_backup = os.dup(1)
    stderr_backup = os.dup(2)
    ok(f"stdout backed up to fd={stdout_backup}, stderr to fd={stderr_backup}")

    # ── Step 2 ──────────────────────────────────────────────
    step(2, "Open a file to capture output. Type:")
    print("       fd = os.open('output.txt', os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)")
    prompt("fd = os.open('output.txt', os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)",
           hint="open the destination file first")

    fd_out = os.open(PATH_OUT, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)
    ok(f"Output file opened as fd={fd_out}")

    # ── Step 3 ──────────────────────────────────────────────
    step(3, "Redirect stdout (fd=1) to the file. Type:")
    print("       os.dup2(fd, 1)")
    prompt("os.dup2(fd, 1)", hint="dup2(source, destination) — make fd 1 point to our file")

    os.dup2(fd_out, 1)
    os.close(fd_out)
    os.write(1, b"  [INFO]  stdout is now pointing to the file!\n")

    # Write to fd=1 — goes to file, not terminal
    os.write(1, b"[LINE 1] This was captured to file!\n")
    os.write(1, b"[LINE 2] os.write(1,...) goes to fd=1 = file now!\n")

    # Also redirect stderr
    fd_err = os.open(PATH_ERR, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)
    os.dup2(fd_err, 2)
    os.close(fd_err)
    os.write(2, b"[STDERR] This error was captured to a separate file!\n")

    # ── Step 4 ──────────────────────────────────────────────
    # Restore first so user can see the prompt
    os.dup2(stdout_backup, 1)
    os.dup2(stderr_backup, 2)
    os.close(stdout_backup)
    os.close(stderr_backup)

    step(4, "Restore stdout back to terminal. Type:")
    print("       os.dup2(stdout_backup, 1)")
    prompt("os.dup2(stdout_backup, 1)", hint="put the backup back into slot 1")
    ok("stdout restored! You can see this line again.\n")

    # Show what was captured
    info("Contents captured in stdout file:")
    with open(PATH_OUT) as f:
        for line in f:
            print(f"    {line}", end="")

    print()
    info("Contents captured in stderr file:")
    with open(PATH_ERR) as f:
        for line in f:
            print(f"    {line}", end="")

    print("""
  ┌────────────────────────────────────────────────────┐
  │  KEY RULES                                         │
  │                                                    │
  │  os.dup(fd)         →  copy to next free slot      │
  │  os.dup2(old, new)  →  copy to exact slot          │
  │  Always backup 1 & 2 before redirecting!           │
  │  Shell  >  and  2>  and  2>&1  all use dup2()      │
  └────────────────────────────────────────────────────┘
""")
