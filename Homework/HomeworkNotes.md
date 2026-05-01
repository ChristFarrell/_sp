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

This homework was getting helped by AI Studio for help understanding.<br>
Link for AI Studio: https://drive.google.com/file/d/1BDKRE_nTXJBhwT9r4pGfFLhd62WGHIDn/view?usp=sharing, https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221tHv_waIfEXIO7Fbbc5wAahwMiXirHn-T%22%5D,%22action%22:%22open%22,%22userId%22:%22100059528919497194278%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing<br>

We asked to make the fundamental of Linux POSIX System Calls, by implement them using of C language. The program itself was devide for 4 section.

1. Process Management<br>
    - **fork ()** Used to create a new process by duplicating the calling process.
        - Child Process: Receives a return value of 0.  
        - Parent Process: Receives the Process ID (PID) of the child.  
        - Use wait() to ensure the parent pauses until the child finished.
        ```
        6365: Hello World from Child Process!
        6364: Hello World from Parent Process! (My child is 6365)
        christianofarrellrachman@cloudshell:~$ ./fork_program
        6377: Hello World from Child Process!
        6376: Hello World from Parent Process! (My child is 6377)
        ```

    - **execvp ()** Replaces the current process image with a new process image.
        - Replacement: If successful, the original program stops entirely, and the new command (e.g., ls) takes over the process space.
        ```
        8197: I am about to run the 'ls' command using execvp...
        total 244
        -rw-r--r-- 1 christianofarrellrachman christianofarrellrachman   415 May  1 02:18 close.c
        -rwxr-xr-x 1 christianofarrellrachman christianofarrellrachman 16088 May  1 02:18 close_program
        -rw-r--r-- 1 christianofarrellrachman christianofarrellrachman  1255 May  1 02:29 combine.c
        -rwxr-xr-x 1 christianofarrellrachman christianofarrellrachman 16304 May  1 02:29 combine_program
        -rw-r--r-- 1 christianofarrellrachman christianofarrellrachman    28 May  1 02:19 database.dat
        -rw-r--r-- 1 christianofarrellrachman christianofarrellrachman   443 May  1 02:23 dup2.c
        -rwxr-xr-x 1 christianofarrellrachman christianofarrellrachman 16216 May  1 02:23 dup2_program
        -rw-r--r-- 1 christianofarrellrachman christianofarrellrachman   386 May  1 02:13 execvp.c
        -rwxr-xr-x 1 christianofarrellrachman christianofarrellrachman 16144 May  1 02:30 execvp_program
        -rw-r--r-- 1 christianofarrellrachman christianofarrellrachman   488 May  1 02:08 fork.c
        -rwxr-xr-x 1 christianofarrellrachman christianofarrellrachman 16128 May  1 02:12 fork_program
        -rw-r--r-- 1 christianofarrellrachman christianofarrellrachman   488 May  1 02:07 fork.py
        drwxr-xr-x 3 christianofarrellrachman christianofarrellrachman  4096 May  1 02:09 gopath
        -rw-r--r-- 1 christianofarrellrachman christianofarrellrachman   406 May  1 02:14 open
        -rw-r--r-- 1 christianofarrellrachman christianofarrellrachman   406 May  1 02:17 open.c
        -rwxr-xr-x 1 christianofarrellrachman christianofarrellrachman 16040 May  1 02:17 open_program
        -rw-r--r-- 1 christianofarrellrachman christianofarrellrachman   438 May  1 02:22 read.c
        -rwxr-xr-x 1 christianofarrellrachman christianofarrellrachman   913 May  1 02:05 README-cloudshell.txt
        -rwxr-xr-x 1 christianofarrellrachman christianofarrellrachman 16176 May  1 02:21 read_program
        -rw-r--r-- 1 christianofarrellrachman christianofarrellrachman   612 May  1 02:28 stderr2.c
        -rwxr-xr-x 1 christianofarrellrachman christianofarrellrachman 16104 May  1 02:28 stderr2_program
        -rw-r--r-- 1 christianofarrellrachman christianofarrellrachman   354 May  1 02:25 stdin0.c
        -rwxr-xr-x 1 christianofarrellrachman christianofarrellrachman 16144 May  1 02:25 stdin0_program
        -rw-r--r-- 1 christianofarrellrachman christianofarrellrachman   313 May  1 02:27 stdout1.c
        -rwxr-xr-x 1 christianofarrellrachman christianofarrellrachman 16008 May  1 02:27 stdout1_program
        -rw-r--r-- 1 christianofarrellrachman christianofarrellrachman    25 May  1 02:22 testfile.txt
        -rw-r--r-- 1 christianofarrellrachman christianofarrellrachman   396 May  1 02:22 write.c
        -rwxr-xr-x 1 christianofarrellrachman christianofarrellrachman 16128 May  1 02:19 write_program
        ```
 
2. Basic I/O Operations
    - **open()** : Creates a connection between a file and a file descriptor.
        - Flags: Uses flags like O_CREAT (create if missing), O_WRONLY (write only), and O_RDONLY (read only).
        - Permissions: Uses octal modes (e.g., 0644) to set file permissions.
        ```
        christianofarrellrachman@cloudshell:~$ ./open_program 
        Successfully opened file! Linux gave it File Descriptor (FD): 3
        ``` 

    - **close()** : Terminates the connection to a file descriptor, releasing the resource back to the system. It returns 0 on success.
        ```
        christianofarrellrachman@cloudshell:~$ ./close_program 
        Opened file with FD: 3
        Successfully closed FD 3.
        ``` 

    - **read()** : Attempts to read a specified number of bytes from a file descriptor into a buffer.
        ```
        christianofarrellrachman@cloudshell:~$ ./read_program 
        Data read from file:
        Hello Linux File System!
        ``` 

    - **write()** : Writes a specified number of bytes from a buffer to a file descriptor.
        ```
        christianofarrellrachman@cloudshell:~$ ./write_program
        Wrote data to the file using write().
        ``` 
3. Advanced Descriptor Handling<br>
    **dup2()**Duplicates an existing file descriptor onto a specific descriptor number.
    - Redirection: Duplicate a file FD into a specific number (like 10), it will be reading from 10 and exactly the same as reading from the original file.  
        ```
        christianofarrellrachman@cloudshell:~$ ./dup2_program 
        Original FD: 3
        Duplicated FD: 10
        Read from FD 10: Hello Linux File Sys
        ```

4. File Descriptors (FD)<br>
    Every open file or communication channel is represented by an integer called a File Descriptor.
    - **stdin0** : Standard input (keyboard/input stream).
        ```
        christianofarrellrachman@cloudshell:~$ ./stdin0_program 
        Type something and press Enter: hello
        You typed 6 bytes from FD 0: hello
        ```

    - **stdout1** : Standard output (terminal display).
        ```
        christianofarrellrachman@cloudshell:~$ ./stdout1_program
        [WARNING] System Initialized.
        ```
    
    - **stderr2** : Standard error (error logs/diagnostic messages).
        ```
        christianofarrellrachman@cloudshell:~$ ./stderr2_program 
        Running program normally on FD 1...
        [ERROR] File: stderr2.c | Line: 17 | Could not connect to database!
        [ERROR] File: stderr2.c | Line: 18 | Memory allocation failed!
        ```  