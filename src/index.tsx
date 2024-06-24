import { render } from "preact";
import "./index.css";
import TerminalComponent from "./term";
import application from "socket:application";
// import "./next/kvext";

const App = () => {
  const onClick = async () => {
    const windows = (await application.getWindows()).length;
    application.createWindow({
      index: windows + 1,
      path: "index.html",
    });
  };
  return (
    <div>
      <button onClick={onClick}>new terminal</button>
      <TerminalComponent />
    </div>
  );
};

render(<App />, document.getElementById("app")!);
