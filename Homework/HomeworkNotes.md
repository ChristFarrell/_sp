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

## [Homework 2]()