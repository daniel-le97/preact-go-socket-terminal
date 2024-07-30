import { render } from "preact";
import "./index.css";
import TerminalComponent from "./terminal";

const App = () => {
  return (
    <div>
      <TerminalComponent />
    </div>
  );
};

render(<App />, document.getElementById("app")!);

