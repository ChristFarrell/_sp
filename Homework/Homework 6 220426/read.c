#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>

int main() {
    int fd = open("testfile.txt", O_RDONLY);
    if (fd < 0) {
        printf("Run write.c first to create the file!\n");
        return 1;
    }

    char buffer[100] = {0}; // Empty buffer
    // read(file_descriptor, buffer, max_bytes)
    read(fd, buffer, sizeof(buffer) - 1); 
    
    printf("Data read from file:\n%s", buffer);
    close(fd);
    return 0;
}
