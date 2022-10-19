import React, { FC, useState } from "react";
import { useParams } from "react-router-dom";
import { XTerm } from "xterm-for-react";
import Xterm from "xterm-for-react/dist/src/XTerm";
import { fetchInstanceExec } from "./api/instances";
import { Row } from "@canonical/react-components";

type Params = {
  name: string;
};

const InstanceTerminal: FC = () => {
  const [input, setInput] = useState("");
  const { name } = useParams<Params>();
  const xtermRef = React.useRef<Xterm>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const loadConsole = async () => {
    if (!name) {
      return;
    }

    // todo: need to open https://0.0.0.0:8443/ once per browser session,
    // todo: so the secure websockets connect with the self-signed certificate

    const result = await fetchInstanceExec(name);

    const dataUrl = `wss://0.0.0.0:8443${result.operation}/websocket?secret=${result.metadata.metadata.fds["0"]}`;
    const cmdUrl = `wss://0.0.0.0:8443${result.operation}/websocket?secret=${result.metadata.metadata.fds["control"]}`;

    const dataSocket = new WebSocket(dataUrl);
    const controlSocket = new WebSocket(cmdUrl);

    controlSocket.onopen = (event) => {
      console.log("control open", event);
    };

    controlSocket.onerror = (event) => {
      console.log("control error", event);
    };

    controlSocket.onmessage = (message) => {
      console.log("control message", message);
    };

    dataSocket.onopen = (event) => {
      console.log("data open", event);
      setWs(dataSocket);
    };

    dataSocket.onerror = (error) => {
      console.log("data error", error);
    };

    dataSocket.onmessage = (message) => {
      console.log("data message", message);
      message.data.text().then((text: string) => {
        xtermRef.current?.terminal.write(text);
        console.log(`Received: ${text} \r`);
      });
    };
  };

  React.useEffect(() => {
    loadConsole();
  }, []);

  return (
    <>
      <div className="p-panel__header">
        <h4 className="p-panel__title">Terminal for {name}</h4>
      </div>
      <div className="p-panel__content">
        <Row>
          <XTerm
            ref={xtermRef}
            onData={(data) => {
              if (ws) {
                ws.send(data);
                // ws.send('printenv \r', { binary: true }, () => {
                //   setTimeout(() => ws.send('exit \r', { binary: true }), 100);
                //   setTimeout(() => process.exit(0), 200);
                // });
              }

              const code = data.charCodeAt(0);
              if (code === 13 && input.length > 0) {
                // If the user hits enter and there is input, echo it.
                xtermRef.current?.terminal.write(
                  "\r\nYou typed: '" + input + "'\r\n"
                );
                xtermRef.current?.terminal.write("$ ");
                setInput("");
              } else if (code < 32 || code === 127) {
                // Disable control Keys such as arrow keys
                return;
              } else {
                // Add general key press characters to the terminal
                xtermRef.current?.terminal.write(data);
                setInput((val) => `${val}${data}`);
              }
            }}
          />
        </Row>
      </div>
    </>
  );
};

export default InstanceTerminal;
