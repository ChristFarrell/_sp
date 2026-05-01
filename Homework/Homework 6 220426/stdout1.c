#include <unistd.h>
#include <string.h>

int main() {
    // \x1b[31m is RED, \x1b[32m is GREEN, \x1b[0m is RESET
    char *color_msg = "\x1b[31m[WARNING] \x1b[32mSystem Initialized.\x1b[0m\n";
    
    // Write the raw color bytes directly to FD 1
    write(1, color_msg, strlen(color_msg));
    
    return 0;
}