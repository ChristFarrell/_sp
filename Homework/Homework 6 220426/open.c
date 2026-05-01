#include <stdio.h>
#include <fcntl.h> // For open() and O_ flags

int main() {
    // Open a file for writing, create it if it doesn't exist
    int fd = open("testfile.txt", O_CREAT | O_WRONLY | O_TRUNC, 0644);
    
    if (fd < 0) {
        printf("Error opening file!\n");
        return 1;
    }
    
    printf("Successfully opened file! Linux gave it File Descriptor (FD): %d\n", fd);
    return 0;
}