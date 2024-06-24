import { useEffect, useRef, useState } from "preact/hooks";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { FitAddon } from "@xterm/addon-fit";
import { spawn, ChildProcess } from "socket:child_process";
import * as fs from "socket:fs/promises";

const TerminalComponent: preact.FunctionComponent = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [port, setPort] = useState<string | null>(null);
  let ws: WebSocket | null = null;
  let terminalBinary: ChildProcess | null = null;

  useEffect(() => {
    if (!port) return;
    const term = new Terminal();
    const fitAddon = new FitAddon();
    if (terminalRef.current) {
      term.open(terminalRef.current);
      term.resize(200, 500);
      term.loadAddon(fitAddon);
      fitAddon.fit();
    }

    ws = new WebSocket(`ws://localhost:${port}/ws`);
    ws.onopen = () => {
      console.log("connected to ws");
      term.write("Connected to backend...\r\n");
    };

    ws.onmessage = (event) => {
      // console.log("onmessage" + event.data);
      term.write(event.data);
    };
    term.onData((data) => {
      if (data === "\u0003") {
        ws?.send("\u0003");
      } else if (data === "\u0011") {
        ws?.send("\u0011");
      } else if (data === "\u0004") {
        ws?.send("\u0004");
      } else {
        ws?.send(data);
      }
    });
  }, [port]);

  useEffect(() => {
    fs.readFile("keys.json", { encoding: "utf8" }).then((data) => {
      const keys = JSON.parse(data.toString()) as { port: string };
      let port = keys.port;
      if (port !== "") {
        setPort(port);
        console.log("connecting to backend directly");
        return;
      }
      terminalBinary = spawn("./binaries/terminal");
      console.log("spawned backend");
      terminalBinary.stderr.on("data", (data: Buffer) => {
        const stderr = Buffer.from(data).toString();
        console.warn(stderr);
        // render(<TerminalComponent />, document.getElementById("app")!);
      });
      terminalBinary.stdout.on("data", (data: Buffer) => {
        const stdout = Buffer.from(data).toString();
        console.log(stdout);
        if (stdout.includes("Starting server on http")) {
          const matchers = stdout.match(/http:\/\/localhost:(\d+)/);
          const port = matchers![1];
          setPort(port);
          fs.writeFile("keys.json", JSON.stringify({ port })).catch(
            console.error
          );
        }
      });
      terminalBinary.on("error", (err: string) => {
        console.error(err);
      });
    });

    return () => {};
  }, []);

  return <div ref={terminalRef} style={{ height: "100%", width: "100%" }} />;
};

export default TerminalComponent;
