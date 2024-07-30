#include <iostream>
#include <string>
#include <sstream>
#include "libgohello.h"

extern "C" {
    void StartServer();
    void ShutdownServer();
    GoInt GetServerPort();
}

int main() {
    std::cout << "Starting Go server..." << std::endl;
    StartServer();

    std::cout << "Server started on port: " << GetServerPort() << std::endl;

    // Keep the process alive and wait for user input to shutdown the server
    std::string input;
    while (true) {
        std::cout << "Enter 'exit' to shut down the server: ";
        std::getline(std::cin, input);

        if (input == "exit") {
            std::cout << "Shutting down the server..." << std::endl;
            ShutdownServer();
            break;
        }
    }

    std::cout << "Server has been shut down. Exiting..." << std::endl;
    return 0;
}