#!/usr/bin/env python3
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src import run, run_file


def main():
    if len(sys.argv) < 2:
        print("Petal Language v1.0.0")
        print("Usage: petal <file.petal>")
        print("       petal -e <code>")
        sys.exit(1)
    
    if sys.argv[1] == '-e':
        run(' '.join(sys.argv[2:]))
    else:
        run_file(sys.argv[1])


if __name__ == '__main__':
    main()
