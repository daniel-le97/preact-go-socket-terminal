import { useEffect, useRef, useState } from "preact/hooks";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { FitAddon } from "@xterm/addon-fit";
import { AttachAddon } from "@xterm/addon-attach";
import * as ext from "socket:extension";
import ipc, { Result } from "socket:ipc";

const TerminalComponent = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [port, setPort] = useState<string | null>(null);

  useEffect(() => {
    if (!port) return;
    let ws = new WebSocket(`ws://localhost:${port}/ws`);
    const term = new Terminal();
    const fitAddon = new FitAddon();
    const attachAddon = new AttachAddon(ws);
    if (terminalRef.current) {
      term.open(terminalRef.current);
      term.resize(200, 500);
      term.loadAddon(fitAddon);
      term.loadAddon(attachAddon);
      fitAddon.fit();
      term.focus();
    }
  }, [port]);

  useEffect(() => {
    const loadPtyServer = async () => {
      await ext.load("pty-server");
      const porter = ((await ipc.request("pty.port")) as Result).data;
      setPort(porter as string);
    };
    loadPtyServer();
  }, []);

  if (!port) {
    return <span class="loading loading-spinner loading-lg"></span>;
  }

  return <div ref={terminalRef} style={{ height: "100%", width: "100%" }} />;
};

export default TerminalComponent;
