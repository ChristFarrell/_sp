#include <stdio.h>
#include <unistd.h>
#include <string.h>

// Advanced C Macro: Automatically injects File Name (__FILE__) and Line Number (__LINE__)
#define LOG_ERROR(msg) \
    do { \
        char err_buf[256]; \
        snprintf(err_buf, sizeof(err_buf), "[ERROR] File: %s | Line: %d | %s\n", __FILE__, __LINE__, msg); \
        write(2, err_buf, strlen(err_buf)); \
    } while(0)

int main() {
    write(1, "Running program normally on FD 1...\n", 36);
    
    // Simulating a critical error
    LOG_ERROR("Could not connect to database!");
    LOG_ERROR("Memory allocation failed!");
    
    return 1;
}