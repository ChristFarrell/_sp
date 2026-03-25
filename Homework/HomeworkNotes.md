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
Follow this link for the notes : https://github.com/ChristFarrell/_sp/tree/master/Homework/Homework%204%20250326 <br>