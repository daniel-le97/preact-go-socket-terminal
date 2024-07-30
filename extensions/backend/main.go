package main

/*
#include <stdint.h>
*/
import "C"
import (
	"fmt"
	"net"
	"net/http"
	// "os"
	"os/exec"
	"runtime"
	"sync"

	"github.com/creack/pty"
	"github.com/gorilla/websocket"
)

var (
	port       int
	server     *http.Server
	serverLock sync.Mutex
	upgrader   = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
)

func getCommand() string {
	switch runtime.GOOS {
	case "darwin":
		return "zsh"
	case "linux":
		return "bash"
	case "windows":
		return "powershell.exe"
	default:
		return "sh"
	}
}

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, r.URL.Path)
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error upgrading connection:", err)
		return
	}
	defer conn.Close()

	cmd := exec.Command(getCommand())
	ptmx, err := pty.Start(cmd)
	if err != nil {
		fmt.Println("Error starting PTY:", err)
		return
	}
	defer ptmx.Close()

	go func() {
		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				fmt.Println("Error reading message:", err)
				return
			}
			ptmx.Write(msg)
		}
	}()

	buf := make([]byte, 1024)
	for {
		n, err := ptmx.Read(buf)
		if err != nil {
			fmt.Println("Error reading from PTY:", err)
			return
		}
		if err := conn.WriteMessage(websocket.TextMessage, buf[:n]); err != nil {
			fmt.Println("Error writing to WebSocket:", err)
			return
		}
	}
}

//export StartServer
func StartServer() {
	serverLock.Lock()
	defer serverLock.Unlock()

	if server != nil {
		fmt.Println("Server already running")
		return
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/", handler)
	mux.HandleFunc("/ws", handleWebSocket)

	listener, err := net.Listen("tcp", ":0")
	if err != nil {
		fmt.Println("Error creating listener:", err)
		return
	}

	port = listener.Addr().(*net.TCPAddr).Port
	server = &http.Server{Handler: mux}

	fmt.Printf("Starting server on http://localhost:%d\n", port)

	go func() {
		if err := server.Serve(listener); err != nil && err != http.ErrServerClosed {
			fmt.Println("Error starting server:", err)
		}
	}()
}

//export ShutdownServer
func ShutdownServer() {
	serverLock.Lock()
	defer serverLock.Unlock()

	if server == nil {
		fmt.Println("Server not running")
		return
	}

	if err := server.Close(); err != nil {
		fmt.Println("Error shutting down server:", err)
	}
	fmt.Println("Server shut down")

	server = nil
	port = 0

}

//export GetServerPort
func GetServerPort() int {
	serverLock.Lock()
	defer serverLock.Unlock()

	return port
}

func main() {
	// This is only for standalone testing
	StartServer()
	serverPort := GetServerPort()
	fmt.Println("Server port:", serverPort)
	ShutdownServer()
}
