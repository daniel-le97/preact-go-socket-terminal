import { useEffect, useRef, useState } from "preact/hooks";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { FitAddon } from "@xterm/addon-fit";

const TerminalComponent: preact.FunctionComponent = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [_socket, setSocket] = useState<WebSocket | null>(null);

  const term = new Terminal();
  const fitAddon = new FitAddon();

  useEffect(() => {
    if (terminalRef.current) {
      term.open(terminalRef.current);
      term.resize(200, 500)
      term.loadAddon(fitAddon);
      fitAddon.fit();
    }

    const ws = new WebSocket("ws://localhost:8080/ws");
    setSocket(ws);

    ws.onopen = () => {
      term?.write("Connected to backend...\r\n");
    };

    ws.onmessage = (event) => {
      term?.write(event.data);
    };

    term?.onData((data) => {
      switch (data) {
        case '\u0003':
          ws.send('\u0003');
          break;
        case '\u0011':
          ws.send('\u0011');
          break;
        case '\u0004':
          ws.send('\u0004');
          break;
        default:
          ws.send(data);
          break;
      }
    });

    return () => {
      term?.dispose();
      ws.close();
    };
  }, []);

  return (
      <div ref={terminalRef} style={{ height: "100%", width: "100%" }} />
  )
};

export default TerminalComponent;
