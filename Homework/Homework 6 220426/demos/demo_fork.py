"""
demos/demo_fork.py  —  Interactive fork() Simulator
"""
import os, sys, subprocess
from utils.printer import info, ok, code, step, prompt, show_concept, pause


def run():
    print("""
  ╔═══════════════════════════════════════════════════╗
  ║   CONCEPT: fork()  —  Create a Child Process     ║
  ╚═══════════════════════════════════════════════════╝

  fork() splits YOUR process into TWO identical copies.
  Both run the same code, but get a different return value:

      Parent  →  receives the child's PID  (a number > 0)
      Child   →  receives 0

              [Your Process]
                     |
                  fork()
                /        \\
       pid > 0 /          \\ pid == 0
     [Parent]              [Child]
     wait for              do work
     child                 exit(0)
""")
    pause()

    # ── Step 1 ──────────────────────────────────────────────
    step(1, "Call fork() to split the process. Type exactly:")
    print("       os.fork()")
    prompt("os.fork()", hint="just type:  os.fork()")

    info("Running os.fork() now...\n")

    if hasattr(os, "fork"):
        pid = os.fork()
        if pid == 0:
            print(f"  \033[92m[CHILD ]\033[0m  I was born! My PID={os.getpid()}, Parent PID={os.getppid()}")
            os._exit(0)
        else:
            print(f"  \033[94m[PARENT]\033[0m  I forked a child! My PID={os.getpid()}, Child PID={pid}")
            os.waitpid(pid, 0)
    else:
        child_code = "import os; print(f'  [CHILD ]  I was born! My PID={os.getpid()}')"
        proc = subprocess.Popen([sys.executable, "-c", child_code], stdout=sys.stdout, stderr=sys.stderr)
        print(f"  \033[94m[PARENT]\033[0m  I spawned a child! My PID={os.getpid()}, Child PID={proc.pid}")
        proc.wait()

    # ── Step 2 ──────────────────────────────────────────────
    step(2, "Check the return value to know who you are. Type:")
    print("       if pid == 0:")
    prompt("if pid == 0:", hint="this is how the child identifies itself")

    print("""
  \033[90m  if pid == 0:
      # YOU ARE THE CHILD
      print("I am the child")
      os._exit(0)
  else:
      # YOU ARE THE PARENT  (pid = child's PID)
      os.wait()  # wait so child doesn't become a zombie\033[0m
""")

    # ── Step 3 ──────────────────────────────────────────────
    step(3, "Always wait for child to finish. Type:")
    print("       os.wait()")
    prompt("os.wait()", hint="parent calls this so child doesn't become a zombie")
    ok("Parent waited. Child cleaned up. No zombie!")

    print("""
  ┌─────────────────────────────────────────┐
  │  KEY RULES                              │
  │                                         │
  │  pid == 0   →  you are the CHILD        │
  │  pid  > 0   →  you are the PARENT       │
  │  pid  < 0   →  fork() FAILED (error)    │
  │  Always call os.wait() in parent!       │
  └─────────────────────────────────────────┘
""")
