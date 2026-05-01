#include <stdio.h>
#include <unistd.h>

int main() {
    printf("%d: I am about to run the 'ls' command using execvp...\n", getpid());
    
    char *args[] = {"ls", "-l", NULL}; // Command and arguments
    
    execvp(args[0], args);
    
    // This line will NEVER run if execvp is successful
    printf("This will not print because execvp replaced the process.\n");
    return 0;
}