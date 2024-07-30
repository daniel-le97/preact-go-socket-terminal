# Terminal and workflow manager

currently this builds a static library in go, and then uses that within a socket extension

## WIP

 - backend PTY handling is written in go
    - [go](https://go.dev/)
    - can be found at ./extensions/backend

 - socket runtime used to build cross platform apps!
   - [socket](https://github.com/socketsupply/socket)

 - uses preact for some react compatibility and signals
    - [preact](https://preactjs.com/)

 - terminal ui
    - [xterm](https://xtermjs.org/)
