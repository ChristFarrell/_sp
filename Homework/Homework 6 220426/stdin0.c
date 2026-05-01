#include <stdio.h>
#include <unistd.h> // For read()

int main() {
    char buffer[100] = {0};
    
    printf("Type something and press Enter: ");
    fflush(stdout);
    
    // Read directly from FD 0 (Standard Input)
    int bytes = read(0, buffer, sizeof(buffer)); 
    
    printf("You typed %d bytes from FD 0: %s", bytes, buffer);
    return 0;
}