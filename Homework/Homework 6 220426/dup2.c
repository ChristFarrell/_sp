#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>

int main() {
    int fd1 = open("testfile.txt", O_RDONLY);
    
    // Copy fd1 into FD number 10
    dup2(fd1, 10); 
    
    printf("Original FD: %d\n", fd1);
    printf("Duplicated FD: 10\n");
    
    char buffer[50] = {0};
    read(10, buffer, 20); // Reading from the duplicated FD
    printf("Read from FD 10: %s\n", buffer);
    
    close(fd1);
    close(10);
    return 0;
}