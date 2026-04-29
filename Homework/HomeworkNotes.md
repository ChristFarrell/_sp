# NOTES

## [Homework 1](https://github.com/ChristFarrell/_sp/tree/master/Homework/Homework%201%20040326)

This homework was getting helped by AI for help understanding.<br>
Link for AI : https://gemini.google.com/share/22f7dfa4fb40 <br>

1. To understanding while process, the compiler will read the code (parser) and execute the code inside of virtual machine. The process is described in several ways:
    - The parser stores the line number just before the while condition is checked.
        ```c
        int start_pc = quad_count;
        ```

    - The program checks to see if the condition of the while loop is met. If it's False, it should know how to exit.
        ```c
        char cond[32]; expression(cond);
        next_token(); next_token(); 
        
        int jmp_f_idx = quad_count;
        emit("JMP_F", cond, "-", "?");
        while (cur_token.type != TK_RBRACE) statement();

        char target_addr[10]; sprintf(target_addr, "%d", start_pc);
        emit("JMP", "-", "-", target_addr); 
        ```

    - Working as Backpatching, which provides a exit program to complete the program.
        ```c
        next_token(); 
        sprintf(quads[jmp_f_idx].result, "%d", quad_count);
        ```

    Simply, the process can be work as like this:<br>
    a. Initialization: i = 1 and sum = 0.<br>
    b. Check Condition: Is i (1) < 11? Yes (True).<br>
    c. Loop Content: * sum = sum + i (sum becomes 1).<br>
    d. i = i + 1 (i becomes 2).<br>
    e. Jump Back (Line 012): Return to line 004.<br>

    Repeat Process: This occurs until i is 10. At that point, sum will add 1+2+3...+10 = 55.<br>
    False Condition: When i becomes 11, line 005 (CMP_LT) will return 0 (False). Line 006 (JMP_F) then sees the 0 and jumps to the end of the program.

2. Inside of the compilers itself, it have diferent division that help to run the code inside of VM Translator. 
    - Lexical Analysis is responsible for reading raw files character by character and converting them into tokens (while, if, etc).
    - Syntax Analysis helps organize the logical structure of the code.
    - Intermediate code generation records instructions in quadruples format (4-part instructions: Op, Arg1, Arg2, Result).
    - Inside virtual machine, it will be tasked to executing the code.
    
    In the p0 file, there are examples of VMTranslator usage. These include add.p0 (a mathematical operation), if.p0 (checking a condition in a code), while.p0 (asking the code to repeat the program), fact.p0 (calculating factorial), and prime.p0 (checking for prime numbers).

## [Homework 2](https://github.com/ChristFarrell/_sp/tree/master/Homework/Homework%202%20110326/petal-lang)

This homework was getting helped by Opencode AI for help understanding.<br>

On this homework, we asked to make new progamming language. Petal Language is statically-typed and interpreted programming language implemented in Python. The installation was using of this code:
```bash
cd petal-lang
```

The feature and operators was used on this Petal Language
- `int` - 64-bit integers
- `float` - 64-bit floating point
- `str` - Strings
- `bool` - Boolean (true/false)
- `void` - No return value
- Arithmetic `+`, `-`, `*`, `/`, `%`
- Comparison `==`, `!=`, `<`, `>`, `<=`, `>=`
- Logical `and`, `or`, `not`

The program itself worked by helping of tokenizer and parser python. The tokenizer converts source code into a stream of tokens using a simple character-by-character scanning approach. It handles:
- Keywords (let, fn, if, else, while, return, and, or, not)
- Identifiers and numbers (int, float)
- Strings with escape sequences
- Single-line comments (//)
- Multi-character operators (==, !=, <=, >=, ->)

The parser itself, is a recursive descent parser builds an Abstract Syntax Tree (AST) from the token stream. Supported syntax:
- Variable declarations (let)
- Function declarations (fn)
- If/else/else-if statements
- While loops
- Return statements
- Binary and unary expressions
- Function calls

Later on, the compiler traverses the AST and generates bytecode instructions for a stack-based virtual machine. As we also remember about last semester class, the Virtual Machine executes bytecode using a stack-based architecture with the following opcodes.
| Opcode | Description |
|--------|-------------|
| CONSTANT | Push constant to stack |
| LOAD_VAR | Load variable onto stack |
| STORE_VAR | Store value from stack to variable |
| ADD, SUB, MUL, DIV, MOD | Arithmetic operations |
| NEG, NOT | Unary operations |
| EQ, NE, LT, GT, LE, GE | Comparison operations |
| AND, OR | Logical operations |
| JUMP, JUMP_IF_FALSE | Control flow |
| CALL, RETURN | Function calls |
| HALT | Stop execution |

## [Homework 3](https://github.com/ChristFarrell/_sp/tree/master/Homework/Homework%203%20180326)

This homework was getting helped by Opencode AI for help understanding.<br>

On this homework, I make the AI Smart Food Assistant (AI 智能美食助手). It's a personal AI-powered healthy meal planning website that helps users generate and track their daily meals. The application provides AI-generated meal recommendations for breakfast, lunch, and dinner, complete with nutrition analysis, cooking instructions, and meal history tracking. Each user has their own personalized dashboard with saved meal plans and history.<br>

1. Translator
    - Have 3 different languages, english, indonesians, and Traditional Chinese
    - The entire website interface is fully translated, including meal descriptions, cooking steps, navigation labels, and all UI elements

2. Groq API
    - Uses **Groq API** with **Llama 3.3 70B Versatile** model for AI meal generation
    - Generates random healthy meals from Indonesian and Chinese cuisines
    - Provides AI-generated descriptions and cooking steps

3. User Authentication (Sign In / Sign Up)
    - **Sign Up**: Create a new account with username and password
    - **Sign In**: Login with existing credentials
    - **Logout**: Secure logout functionality
    - Each user's data is stored separately in localStorage

4. Meal and Nutrition
    - Generate AI-powered meal recommendations for:
        - **Breakfast** (300-450 kcal range)
        - **Lunch** (500-700 kcal range)
        - **Dinner** (500-750 kcal range)
    - Confirm meals to add to daily plan
    - Progress tracking vs daily recommendations

5. History Calendar
    - Calendar view of past meals
    - Click on dates with recorded meals to view history

The data storage atructure can be seen as inside of localStorage
```
localStorage:
├── food_users                  # All registered users
├── current_user                # Currently logged in user
├── groq_api_key                # User's API key
├── user_{id}_confirmed_meals   # Today's confirmed meals
├── user_{id}_saved_date        # Last saved date
└── user_{id}_meal_history      # Historical meal data
```

The technical stack will work as this:
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **API**: Groq API (Llama 3.3 70B)
- **Storage**: localStorage (per-user)
- **Language**: JavaScript (JSX)

## [Homework 4](https://github.com/ChristFarrell/_sp/tree/master/Homework/Homework%204%20250326)

This homework was getting helped by Opencode AI for help understanding.<br>

The book contain of 5 chapter<br>
1. CH-1 : Pyhton Fundamentals
   Learn Python from scratch with AI assistance. Covers variables, data types, control flow, functions, and your first projects.
2. CH-2 : JavaScript Essentials 
   Master JavaScript with AI guidance. Learn DOM manipulation, events, async programming, and build interactive web pages.
3. CH-3 : Web Development with AI
   Build modern websites using HTML, CSS, and frameworks—guided by AI from design to deployment.
4. CH-4 : Data Science & AI
   Dive into data analysis, visualization, and machine learning concepts with hands-on AI tutoring.
5. CH-5 : Competitive Programming
   Sharpen your problem-solving skills with AI-assisted algorithm practice and coding challenges.

## [Homework 5](https://github.com/ChristFarrell/_sp/tree/master/Homework/Homework%205%20150426)

This homework was getting helped by Opencode AI and Claude for help understanding.<br>
Link for Claude: https://claude.ai/share/85fb1a52-a690-4ba0-acf8-51d060f99f0b<br>
Full explanation: https://github.com/ChristFarrell/_sp/blob/master/Homework/Homework%205%20150426/notes.md<br>

1. Bank Account Simulation<br>
   This simulation demonstrates **race conditions** and how to prevent them using **mutexes (locks)**. It simulates a person performing 100,000 deposits and 100,000 withdrawals on the same bank account using concurrent threads.
    ```
    Initial balance: $100
    Thread 1 (Deposit $50):          Thread 2 (Withdraw $30):
    1. Read balance = $100           1. Read balance = $100
    2. Calculate: 100 + 50 = 150     2. Calculate: 100 - 30 = 70
    3. Write balance = $150          3. Write balance = $70

    Final balance: $70 (WRONG! Should be $120)
    ```

    One update is completely lost because both threads read the same initial value before either wrote their result back.

    The code work by using of:<br>
    **Mutex (Mutual Exclusion):**
    - Ensures only one thread can execute a critical section at a time
    - Implemented in Python as `threading.Lock()`
    - Use `acquire()` to lock, `release()` to unlock (or use `with` for automatic handling)

    **Critical Section:**
    - Code that accesses shared mutable state
    - Must be protected to prevent race conditions
    - In this case: reading and writing `self.balance`

    **Atomicity:**
    - An atomic operation appears to happen instantaneously from other threads' perspectives
    - No thread can observe a half-completed atomic operation
    - Locks make non-atomic operations appear atomic

2. Producer-Consumer Problem<br>
   This demonstrates how to coordinate threads that produce data (producers) and threads that consume data (consumers) using a **bounded buffer** and **condition variables**.

    ```
    Producers → [Bounded Buffer] → Consumers
    P1, P2        (Queue)         C1, C2, C3
    ```

    - **Producers** generate items and add them to a shared buffer
    - **Consumers** remove items from the buffer and process them
    - **Buffer** has limited capacity (bounded)

    The code work by using of:
    **Bounded Buffer:**
    - Prevents unlimited memory growth
    - Naturally throttles producers when consumers are slow

    **Condition Variables:**
    - More efficient than busy-waiting (checking repeatedly)
    - Threads sleep while waiting, saving CPU
    - Woken only when state changes

    **Wait-Notify Pattern:**
    - Producers notify consumers after adding items
    - Consumers notify producers after removing items
    - Both sides can make progress

    **Flow Control:**
    - Fast producers don't overwhelm slow consumers
    - System reaches natural equilibrium

3. Dining Philosophers Problem<br>
   This is a classic synchronization problem that illustrates **deadlock** and strategies to prevent it. Five philosophers sit at a round table, alternating between thinking and eating, but they need two forks (shared resources) to eat.
   ```
             Fork 0
        P0          P1
    Fork 4            Fork 1
        P4          P2
              P3
        Fork 3  Fork 2
    ```

    - 5 philosophers (P0-P4) sit around a circular table
    - 5 forks placed between each pair of philosophers
    - Each philosopher needs BOTH adjacent forks to eat
    - After eating, they release both forks and think

    For the solution, the code work by:<br>
    ```
    Normal philosophers (P0-P3):
    - Pick up LEFT fork first, then RIGHT fork

    Philosopher 4:
    - Would normally pick up Fork 4 (left), then Fork 0 (right)
    - But Fork 0 has lower ID than Fork 4
    - So P4 picks up Fork 0 first, then Fork 4
    - This breaks the circular wait!
    ```

    Each philosopher:
    - **Thinks** for a random duration (0.5-1.5s)
    - Gets **hungry** and requests forks
    - **Waits** if forks aren't available
    - **Eats** when both forks are acquired (0.3-0.8s)
    - **Releases** forks and repeats

## [Homework 6](https://github.com/ChristFarrell/_sp/tree/master/Homework/Homework%206%20220426)

This homework was getting helped by Claude for help understanding.<br>
Link for Claude: https://claude.ai/share/3e029e3c-11bc-45f6-b527-e233c07d251b<br>

We asked to make the Linux System Programming — Interactive Simulator. A hands-on Python project that teaches core Linux system programming concepts through interactive step-by-step demos. 

> Works on **Windows** (via `subprocess`) and **Linux/Mac** (via real `fork`, `execvp`, etc.)
To run the code:
```
python main.py
```
Pick a demo from the menu (1–7), or type `8` to run all in order.<br>
Each demo walks you through a concept **one step at a time**:
```
[Step 1]  Call fork() to split the process. Type:
          os.fork()
  $ os.fork()       ← you type this
  ✓ Correct!        ← then the real code runs
```

- Type the command shown exactly
- If wrong → it tells you and lets you retry
- If correct → the code **actually executes** on your machine
Do demos **1 → 7 in order** for the best learning flow.

1. `fork()` — Create a Child Process
Splits the current process into two identical copies running at the same time.

```
[Your Process]
       |
    fork()
   /        \
Parent        Child
pid > 0       pid == 0
```

- `pid == 0` → you are the child
- `pid > 0`  → you are the parent, pid = child's PID
- Always call `os.wait()` so the child doesn't become a zombie

2. `execvp()` — Replace Process with a Program
Completely replaces the running program with a new one. Same PID, new code.

```
os.execvp("ls", ["ls", "-lh"])
```

- Lines after `execvp()` are **never reached** if it succeeds
- Pattern: always `fork()` first, then `execvp()` inside the child
- On Windows: simulated with `subprocess.run()`

3. `open()` / `close()` — File Descriptors
Every file/device/pipe is accessed through a **file descriptor (fd)** — a small integer the OS gives you.

```
fd table per process:
┌────┬──────────────────┐
│ 0  │ stdin  (keyboard)│
│ 1  │ stdout (terminal)│
│ 2  │ stderr (terminal)│
│ 3  │ ← your file here │
└────┴──────────────────┘
```

Common flags: `O_RDONLY`, `O_WRONLY`, `O_CREAT`, `O_TRUNC`, `O_APPEND`<br>
Always `close()` when done — leaked fds cause bugs.

4. `read()` / `write()` — Low-level I/O
Move raw bytes in and out through a file descriptor.

```python
os.write(fd, b"Hello!\n")   # send bytes INTO fd
os.read(fd, 1024)            # pull bytes FROM fd
```

- Data must be **bytes** (`b"..."` or `"text".encode()`)
- `read()` may return fewer bytes than asked — always loop
- `read()` returns `b""` at end of file

5. `stdin(0)` / `stdout(1)` / `stderr(2)` — Standard File Descriptors
Every process gets these 3 fds automatically at startup.

| fd | name   | default         |
|----|--------|-----------------|
| 0  | stdin  | keyboard input  |
| 1  | stdout | terminal output |
| 2  | stderr | error output    |

These are just numbers — `dup2()` can point them anywhere.<br>
Shell redirects work because of these:
```
prog > out.txt      →  fd 1 redirected to file
prog 2> err.txt     →  fd 2 redirected to file
prog < in.txt       →  fd 0 redirected from file
```

6. `dup2()` — Redirect File Descriptors
Makes `new_fd` point to the same place as `old_fd`.

```
Before dup2(3, 1):        After dup2(3, 1):
┌────┬───────────┐         ┌────┬───────────┐
│ 1  │ terminal  │  →      │ 1  │ file.txt  │ ← redirected!
│ 3  │ file.txt  │         │ 3  │ file.txt  │
└────┴───────────┘         └────┴───────────┘
```

Steps to redirect stdout to a file:<br>
```python
backup = os.dup(1)                          # save original stdout
fd = os.open("out.txt", os.O_WRONLY|...)   # open destination
os.dup2(fd, 1)                             # redirect stdout → file
os.close(fd)                               # clean up extra fd
# ... write stuff ...
os.dup2(backup, 1)                         # restore stdout
os.close(backup)
```

> **Windows note:** After `dup2()`, only use `os.write(1, b"...")` — never `print()` or `sys.stdout.write()` until restored.

7. Pipeline — All Concepts Combined
Simulates `cat data.txt | grep "KEEP"` built from scratch.

```
[Parent]
   ├── fork() ──► [Child A]  open file → write to pipe write-end
   │                    dup2(pipe_w, 1)   (stdout → pipe)
   │
   └── fork() ──► [Child B]  read from pipe read-end → filter → print
                       dup2(pipe_r, 0)   (stdin ← pipe)
```

Every concept is used here: `fork`, `pipe`, `dup2`, `open`, `read`, `write`, `close`, `wait`, fd 0/1/2.

**Windows vs Linux**

| Concept      | Linux            | Windows (this project)      |
|--------------|------------------|-----------------------------|
| `fork()`     | `os.fork()`      | `subprocess.Popen()`        |
| `execvp()`   | `os.execvp()`    | `subprocess.run()`          |
| `open/close` | `os.open/close()`| same — works natively       |
| `read/write` | `os.read/write()`| same — works natively       |
| `dup2()`     | `os.dup2()`      | same — works natively       |
| `pipe()`     | `os.pipe()`      | `subprocess.PIPE`           |

Example of output:
```

╔══════════════════════════════════════════════════════════╗
║       Linux System Programming — Interactive Simulator   ║
║                                                          ║
║  fork · execvp · open · close · read · write             ║
║  dup2 · stdin(0) · stdout(1) · stderr(2)                 ║
╚══════════════════════════════════════════════════════════╝

────────────────────────────────────────────────────────
  HOW TO USE THIS SIMULATOR
────────────────────────────────────────────────────────

  1. Type the command shown, press ENTER. If wrong, it tells you and lets you retry.
  2. Each demo walks you through the real system calls step by step.
  3. The code actually RUNS after you type each command — not just a simulation!
  4. Do demos 1 to 7 in order for the best learning experience.


  Press ENTER to continue...

────────────────────────────────────────────────────────
  MAIN MENU — choose a demo to run
────────────────────────────────────────────────────────

    [1]  fork()                   Create child process
    [2]  execvp()                 Replace process with program
    [3]  open() / close()         File descriptors
    [4]  read() / write()         Low-level I/O
    [5]  stdin / stdout / stderr  fd 0, 1, 2
    [6]  dup2()                   Redirect file descriptors
    [7]  Pipeline                 ALL concepts combined

    [8]  Run ALL demos in order
    [0]  Exit

  Tip: do them in order 1→7 for best understanding!

  >> 1

────────────────────────────────────────────────────────
  FORK()                   CREATE CHILD PROCESS
────────────────────────────────────────────────────────

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
                /        \
       pid > 0 /          \ pid == 0
     [Parent]              [Child]
     wait for              do work
     child                 exit(0)


  Press ENTER to continue...

  [Step 1]  Call fork() to split the process. Type exactly:
       os.fork()
    Hint: just type:  os.fork()
  user@ubuntu:~$ os.fork()
    ✓ Correct!
  [INFO]  Running os.fork() now...

  [PARENT]  I spawned a child! My PID=16368, Child PID=5172
  [CHILD ]  I was born! My PID=5172

  [Step 2]  Check the return value to know who you are. Type:
       if pid == 0:
    Hint: this is how the child identifies itself
  user@ubuntu:~$ if pid == 0
```