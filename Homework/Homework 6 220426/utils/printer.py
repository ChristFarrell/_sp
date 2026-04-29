"""utils/printer.py — shared print helpers"""

def banner():
    print("""
\033[96m╔══════════════════════════════════════════════════════════╗
║       Linux System Programming — Interactive Simulator   ║
║                                                          ║
║  fork · execvp · open · close · read · write             ║
║  dup2 · stdin(0) · stdout(1) · stderr(2)                 ║
╚══════════════════════════════════════════════════════════╝\033[0m
""")

def section(title: str):
    print(f"\n\033[93m{'─'*56}\033[0m")
    print(f"\033[93m  {title}\033[0m")
    print(f"\033[93m{'─'*56}\033[0m\n")

def info(msg: str):
    print(f"  \033[94m[INFO]\033[0m  {msg}")

def ok(msg: str):
    print(f"  \033[92m[ OK ]\033[0m  {msg}")

def err(msg: str):
    print(f"  \033[91m[ERR ]\033[0m  {msg}")

def code(msg: str):
    print(f"  \033[90m>>> {msg}\033[0m")

def pause():
    try:
        input("\n  \033[90mPress ENTER to continue...\033[0m\n")
    except EOFError:
        pass

def step(number: int, instruction: str):
    """Print a numbered step instruction telling user what to type."""
    print(f"\n  \033[95m[Step {number}]\033[0m  {instruction}")

def prompt(expected: str, hint: str = "") -> str:
    """
    Show a fake terminal prompt. User must type the expected command.
    Keeps asking until they type it correctly.
    """
    if hint:
        print(f"  \033[90m  Hint: {hint}\033[0m")
    while True:
        try:
            user_input = input(f"  \033[32muser@ubuntu:~$\033[0m ").strip()
        except EOFError:
            return expected
        if user_input == expected:
            print(f"  \033[92m  ✓ Correct!\033[0m")
            return user_input
        else:
            print(f"  \033[91m  ✗ Not quite. Expected:  {expected}\033[0m  Try again.")

def show_concept(title: str, diagram: str):
    """Display a concept box with diagram."""
    print(f"\n  \033[96m  Concept: {title}\033[0m")
    for line in diagram.strip().split("\n"):
        print(f"  \033[90m  {line}\033[0m")
    print()
