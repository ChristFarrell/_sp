#include <stdio.h>
#include <fcntl.h>
#include <unistd.h> // For close()

int main() {
    int fd = open("testfile.txt", O_CREAT | O_WRONLY, 0644);
    printf("Opened file with FD: %d\n", fd);
    
    int close_status = close(fd); // Closing the file
    
    if (close_status == 0) {
        printf("Successfully closed FD %d.\n", fd);
    } else {
        printf("Failed to close file.\n");
    }
    return 0;
}