# NOTES

## [Homework 1]()

This homework was getting helped by AI for help understanding.<br>
Link for AI

1. To understanding while process, the compiler will read the code (parser) and execute the code inside of virtual machine. The process is described in several ways:
    - The parser stores the line number just before the while condition is checked.
    ```
    int start_pc = quad_count;
    ```

    - The program checks to see if the condition of the while loop is met. If it's False, it should know how to exit. This
    ```
    char cond[32]; expression(cond);
    next_token(); next_token(); 
        
    int jmp_f_idx = quad_count;
    emit("JMP_F", cond, "-", "?");
    while (cur_token.type != TK_RBRACE) statement();

    char target_addr[10]; sprintf(target_addr, "%d", start_pc);
    emit("JMP", "-", "-", target_addr); 
    ```

    - Working as Backpatching, which provides a exit program to complete the program.
    ```
    next_token(); 
    sprintf(quads[jmp_f_idx].result, "%d", quad_count);
    ```

    Simply, the process can be work as like this:
    a. Initialization: i = 1 and sum = 0.
    b. Check Condition: Is i (1) < 11? Yes (True).
    c. Loop Content: * sum = sum + i (sum becomes 1).
    d. i = i + 1 (i becomes 2).
    e. Jump Back (Line 012): Return to line 004.

    Repeat Process: This occurs until i is 10. At that point, sum will add 1+2+3...+10 = 55.<br>
    False Condition: When i becomes 11, line 005 (CMP_LT) will return 0 (False). Line 006 (JMP_F) then sees the 0 and jumps to the end of the program.

2. 