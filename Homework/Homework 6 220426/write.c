#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>

int main() {
    int fd = open("testfile.txt", O_CREAT | O_WRONLY | O_TRUNC, 0644);
    
    char *text = "Hello Linux File System!\n";
    // write(file_descriptor, buffer, number_of_bytes)
    write(fd, text, strlen(text)); 
    
    printf("Wrote data to the file using write().\n");
    close(fd);
    return 0;
}