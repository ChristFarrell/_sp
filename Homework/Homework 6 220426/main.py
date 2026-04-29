"""
╔══════════════════════════════════════════════════════════════╗
║    Linux System Programming — Interactive Simulator          ║
║                                                              ║
║  Topics:  fork · execvp · open · close · read · write        ║
║           dup2 · stdin(0) · stdout(1) · stderr(2)            ║
╚══════════════════════════════════════════════════════════════╝

Run:   python main.py
"""

from utils.printer import banner, section, pause
from demos import (
    demo_fork,
    demo_exec,
    demo_open_close,
    demo_read_write,
    demo_std_fds,
    demo_dup2,
    demo_pipeline,
)

MENU = [
    ("fork()                   Create child process",          demo_fork.run),
    ("execvp()                 Replace process with program",  demo_exec.run),
    ("open() / close()         File descriptors",              demo_open_close.run),
    ("read() / write()         Low-level I/O",                 demo_read_write.run),
    ("stdin / stdout / stderr  fd 0, 1, 2",                    demo_std_fds.run),
    ("dup2()                   Redirect file descriptors",     demo_dup2.run),
    ("Pipeline                 ALL concepts combined",         demo_pipeline.run),
]

INSTRUCTIONS = [
    "Type the command shown, press ENTER. If wrong, it tells you and lets you retry.",
    "Each demo walks you through the real system calls step by step.",
    "The code actually RUNS after you type each command — not just a simulation!",
    "Do demos 1 to 7 in order for the best learning experience.",
]


def print_instructions():
    section("HOW TO USE THIS SIMULATOR")
    for i, line in enumerate(INSTRUCTIONS, 1):
        print(f"  {i}. {line}")
    print()
    pause()


def main():
    banner()
    print_instructions()

    while True:
        section("MAIN MENU — choose a demo to run")
        for i, (label, _) in enumerate(MENU, 1):
            print(f"    [{i}]  {label}")
        print(f"\n    [8]  Run ALL demos in order")
        print(f"    [0]  Exit")
        print(f"\n  Tip: do them in order 1→7 for best understanding!\n")

        choice = input("  >> ").strip()

        if choice == "0":
            print("\n  Bye! Keep hacking Linux.\n")
            break
        elif choice == "8":
            for label, fn in MENU:
                section(label.upper())
                fn()
                pause()
        elif choice.isdigit() and 1 <= int(choice) <= len(MENU):
            label, fn = MENU[int(choice) - 1]
            section(label.upper())
            fn()
            pause()
        else:
            print("  Invalid choice — try again.\n")


if __name__ == "__main__":
    main()
