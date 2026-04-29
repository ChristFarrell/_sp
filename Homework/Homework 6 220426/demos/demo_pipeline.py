"""
demos/demo_pipeline.py  —  Interactive Pipeline Simulator
"""
import os, sys, tempfile, subprocess
from utils.printer import info, ok, code, step, prompt, pause

DATA_FILE = os.path.join(tempfile.gettempdir(), "sysprog_pipeline_data.txt")
KEYWORD = "KEEP"


def _setup_data():
    lines = [
        "apple - discard this\n",
        "KEEP: important data #1\n",
        "banana - not needed\n",
        "KEEP: important data #2\n",
        "cherry - skip\n",
        "KEEP: important data #3\n",
        "mango - ignore\n",
    ]
    with open(DATA_FILE, "w") as f:
        f.writelines(lines)


def run():
    print("""
  ╔═══════════════════════════════════════════════════════╗
  ║   CONCEPT: Pipeline  —  ALL Concepts Combined        ║
  ╚═══════════════════════════════════════════════════════╝

  We recreate this shell command from scratch:

      cat data.txt | grep "KEEP"

  How the shell actually does it:

  [Parent]
     │
     ├── fork() ──► [Child A]  open file → write to pipe
     │                              │
     │              pipe()          ▼ (data flows here)
     │                         ──────────►
     │
     └── fork() ──► [Child B]  read from pipe → filter → print

  dup2() wires:
    Child A  stdout (fd=1) → pipe write end
    Child B  stdin  (fd=0) → pipe read end
""")
    pause()

    _setup_data()
    info(f"Data file ready: {DATA_FILE}")
    print("  Contents:")
    with open(DATA_FILE) as f:
        for line in f:
            print(f"    {line}", end="")
    print()
    pause()

    # ── Step 1 ──────────────────────────────────────────────
    step(1, "Create a pipe to connect the two child processes. Type:")
    print("       pipe_r, pipe_w = os.pipe()")
    prompt("pipe_r, pipe_w = os.pipe()",
           hint="pipe() returns (read_end, write_end) — two fd numbers")

    if hasattr(os, "fork"):
        pipe_r, pipe_w = os.pipe()
        ok(f"Pipe created!  read_end=fd{pipe_r},  write_end=fd{pipe_w}")
    else:
        info("Windows: subprocess will handle the pipe internally")

    # ── Step 2 ──────────────────────────────────────────────
    step(2, "Fork Child A (the 'cat' — reads file, writes to pipe). Type:")
    print("       pid_a = os.fork()")
    prompt("pid_a = os.fork()", hint="Child A will read the file and write into the pipe")

    # ── Step 3 ──────────────────────────────────────────────
    step(3, "Inside Child A — redirect its stdout to the pipe write end. Type:")
    print("       os.dup2(pipe_w, 1)")
    prompt("os.dup2(pipe_w, 1)", hint="now anything Child A writes to stdout goes into the pipe")

    # ── Step 4 ──────────────────────────────────────────────
    step(4, "Fork Child B (the 'grep' — reads pipe, filters lines). Type:")
    print("       pid_b = os.fork()")
    prompt("pid_b = os.fork()", hint="Child B will read from the pipe and filter matching lines")

    # ── Step 5 ──────────────────────────────────────────────
    step(5, "Inside Child B — redirect its stdin from the pipe read end. Type:")
    print("       os.dup2(pipe_r, 0)")
    prompt("os.dup2(pipe_r, 0)", hint="now anything Child B reads from stdin comes from the pipe")

    # ── Step 6 ──────────────────────────────────────────────
    step(6, "Parent closes both pipe ends (it doesn't use them). Type:")
    print("       os.close(pipe_r);  os.close(pipe_w)")
    prompt("os.close(pipe_r);  os.close(pipe_w)",
           hint="CRITICAL! if parent keeps pipe open, Child B never gets EOF")

    # ── Run it ──────────────────────────────────────────────
    print()
    info("Running the full pipeline now...\n")

    if hasattr(os, "fork"):
        # CHILD A — cat
        pid_a = os.fork()
        if pid_a == 0:
            os.close(pipe_r)
            os.dup2(pipe_w, 1)
            os.close(pipe_w)
            fd = os.open(DATA_FILE, os.O_RDONLY)
            while True:
                chunk = os.read(fd, 256)
                if not chunk:
                    break
                os.write(1, chunk)
            os.close(fd)
            os._exit(0)

        # CHILD B — grep
        pid_b = os.fork()
        if pid_b == 0:
            os.close(pipe_w)
            os.dup2(pipe_r, 0)
            os.close(pipe_r)
            buf = b""
            while True:
                chunk = os.read(0, 256)
                if not chunk:
                    break
                buf += chunk
            os.write(2, b"\n  [Child B - grep] Filtered results:\n")
            for line in buf.split(b"\n"):
                if KEYWORD.encode() in line:
                    os.write(1, b"    >>> " + line + b"\n")
            os._exit(0)

        os.close(pipe_r)
        os.close(pipe_w)
        os.waitpid(pid_a, 0)
        os.waitpid(pid_b, 0)

    else:
        # Windows subprocess pipeline
        cat_code = (
            f"f=open(r'{DATA_FILE}'); "
            f"[print(l, end='') for l in f]; f.close()"
        )
        grep_code = (
            "import sys; "
            f"[print('    >>>', l.rstrip()) for l in sys.stdin if '{KEYWORD}' in l]"
        )
        proc_a = subprocess.Popen([sys.executable, "-c", cat_code], stdout=subprocess.PIPE)
        proc_b = subprocess.Popen([sys.executable, "-c", grep_code],
                                   stdin=proc_a.stdout, stdout=sys.stdout)
        proc_a.stdout.close()
        print("\n  [Child B - grep] Filtered results:")
        proc_a.wait()
        proc_b.wait()

    print()
    ok("Pipeline complete!\n")

    # ── Step 7 ──────────────────────────────────────────────
    step(7, "Parent waits for both children to finish. Type:")
    print("       os.waitpid(pid_a, 0);  os.waitpid(pid_b, 0)")
    prompt("os.waitpid(pid_a, 0);  os.waitpid(pid_b, 0)",
           hint="wait for BOTH children — always clean up!")
    ok("Both children finished. No zombies!")

    print("""
  ┌─────────────────────────────────────────────────────┐
  │  EVERY CONCEPT USED HERE:                           │
  │                                                     │
  │  fork()   → created Child A and Child B             │
  │  pipe()   → channel connecting A output → B input   │
  │  dup2()   → rewired stdout/stdin to pipe fds        │
  │  open()   → opened the data file                    │
  │  read()   → read chunks from file / pipe            │
  │  write()  → wrote data into pipe / stdout           │
  │  close()  → closed unused pipe ends (CRITICAL)      │
  │  wait()   → parent waited for children              │
  │  fd 0,1,2 → stdin/stdout/stderr rewired by dup2     │
  └─────────────────────────────────────────────────────┘
""")
