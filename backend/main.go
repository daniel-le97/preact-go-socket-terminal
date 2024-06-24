package main

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"os/exec"
	"runtime"

	"github.com/creack/pty"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for simplicity, adjust for production
	},
}

func getCommand() string {
	switch runtime.GOOS {
	case "darwin":
		return "zsh"
	case "linux":
		return "bash"
	case "windows":
		return "powershell.exe"
	default:
		return "sh" // Fallback to a basic shell
	}
}

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, r.URL.Path)
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading connection:", err)
		return
	}
	defer conn.Close()

	cmd := exec.Command(getCommand())
	ptmx, err := pty.Start(cmd)
	if err != nil {
		log.Fatal(err)
	}
	defer func() { _ = ptmx.Close() }()

	go func() {
		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				log.Println("Error reading message:", err)
				return
			}
			ptmx.Write(msg)
		}
	}()

	buf := make([]byte, 1024)
	for {
		n, err := ptmx.Read(buf)
		if err != nil {
			log.Println("Error reading from PTY:", err)
			return
		}
		if err := conn.WriteMessage(websocket.TextMessage, buf[:n]); err != nil {
			log.Println("Error writing to WebSocket:", err)
			return
		}
	}
}

func main() {
	// log.Panicln(os.Environ())
	http.HandleFunc("/", handler)
	http.HandleFunc("/ws", handleWebSocket)
	listener, err := net.Listen("tcp", ":0")
	if err != nil {
		fmt.Println("Error creating listener:", err)
		return
	}
	defer listener.Close()

	// Get the assigned port
	port := listener.Addr().(*net.TCPAddr).Port
	fmt.Printf("Starting server on http://localhost:%d\n", port)

	// Start the HTTP server
	err = http.Serve(listener, nil)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}
