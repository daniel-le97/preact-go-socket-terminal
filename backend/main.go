package main

import (
	"log"
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
	http.HandleFunc("/ws", handleWebSocket)
	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
