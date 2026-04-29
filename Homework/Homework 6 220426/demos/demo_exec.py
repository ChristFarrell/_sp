"""
demos/demo_exec.py  —  Interactive execvp() Simulator
"""
import os, sys, subprocess
from utils.printer import info, ok, code, step, prompt, pause


def run():
    print("""
  ╔═══════════════════════════════════════════════════╗
  ║   CONCEPT: execvp()  —  Replace Process Image    ║
  ╚═══════════════════════════════════════════════════╝

  execvp() COMPLETELY REPLACES the running program
  with a different one. Same PID, totally new code.

  Before execvp():          After execvp():
  ┌──────────────┐          ┌──────────────┐
  │  python3     │  ──────► │  /bin/ls     │
  │  (your code) │          │  (new image) │
  └──────────────┘          └──────────────┘

  Lines after execvp() are NEVER reached if it succeeds.
  That's why you always fork() FIRST, then execvp() in child.
""")
    pause()

    # ── Step 1 ──────────────────────────────────────────────
    step(1, "First fork a child. Type:")
    print("       pid = os.fork()")
    prompt("pid = os.fork()", hint="we fork first so the parent stays alive")

    # ── Step 2 ──────────────────────────────────────────────
    step(2, "Inside the child, replace itself with a new program. Type:")
    print("       os.execvp('ls', ['ls', '-lh'])")
    prompt("os.execvp('ls', ['ls', '-lh'])", hint="first arg = program name, second = argument list")

    info("Running fork + execvp now...\n")

    if hasattr(os, "fork"):
        pid = os.fork()
        if pid == 0:
            os.execvp("ls", ["ls", "-lh", os.path.expanduser("~")])
            os._exit(1)
        else:
            _, status = os.waitpid(pid, 0)
            ok(f"Child (ls) finished with exit code: {os.WEXITSTATUS(status)}")
    else:
        tmp = os.environ.get("TEMP", "C:\\Windows\\Temp")
        result = subprocess.run(["cmd", "/c", "dir", tmp], stdout=sys.stdout, stderr=sys.stderr)
        ok(f"Child process finished with exit code: {result.returncode}")

    # ── Step 3 ──────────────────────────────────────────────
    step(3, "Parent waits for child to finish. Type:")
    print("       os.wait()")
    prompt("os.wait()", hint="parent always waits after fork")
    ok("Done! Parent continued after child (ls) finished.")

    print("""
  ┌─────────────────────────────────────────────────┐
  │  KEY RULES                                      │
  │                                                 │
  │  execvp(prog, [prog, arg1, arg2])               │
  │  argv[0] must be the program name itself        │
  │  execvp() never returns if successful           │
  │  Always fork() before execvp() in real code     │
  └─────────────────────────────────────────────────┘
""")
