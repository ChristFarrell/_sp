#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    pid_t pid = fork();

    if (pid < 0) {
        printf("Fork failed!\n");
        return 1;
    } else if (pid == 0) {
        // Child process
        printf("%d: Hello World from Child Process!\n", getpid());
    } else {
        // Parent process
        wait(NULL); // Wait for child to finish
        printf("%d: Hello World from Parent Process! (My child is %d)\n", getpid(), pid);
    }
    return 0;
}