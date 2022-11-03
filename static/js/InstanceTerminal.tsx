import React, { FC, useLayoutEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { XTerm } from "xterm-for-react";
import Xterm from "xterm-for-react/dist/src/XTerm";
import { FitAddon } from "xterm-addon-fit";
import { fetchInstanceExec } from "./api/instances";
import { Row } from "@canonical/react-components";
import NotificationRow from "./components/NotificationRow";
import { Notification } from "./types/notification";
import { getWsErrorMsg } from "./helpers/helpers";
import BaseLayout from "./components/BaseLayout";

type Params = {
  name: string;
};

const InstanceTerminal: FC = () => {
  const { name } = useParams<Params>();
  const xtermRef = React.useRef<Xterm>(null);
  const textEncoder = new TextEncoder();
  const [dataWs, setDataWs] = useState<WebSocket | null>(null);
  const [controlWs, setControlWs] = useState<WebSocket | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const [fitAddon] = useState<FitAddon>(new FitAddon());

  const openWebsockets = async () => {
    if (!name) {
      return;
    }

    const result = await fetchInstanceExec(name);

    const dataUrl = `wss://${location.host}${result.operation}/websocket?secret=${result.metadata.metadata.fds["0"]}`;
    const controlUrl = `wss://${location.host}${result.operation}/websocket?secret=${result.metadata.metadata.fds["control"]}`;

    const data = new WebSocket(dataUrl);
    const control = new WebSocket(controlUrl);

    control.onopen = () => {
      setControlWs(control);
    };

    control.onerror = () => {
      setNotification({
        message: "There was an error with control websocket",
        type: "negative",
      });
    };

    control.onclose = (event) => {
      setNotification({
        message: getWsErrorMsg(event.code),
        type: "negative",
      });
    };

    control.onmessage = (message) => {
      console.log("control message", message);
    };

    data.onopen = () => {
      setDataWs(data);
    };

    data.onerror = () => {
      setNotification({
        message: "There was an error with data websocket",
        type: "negative",
      });
    };

    data.onclose = (event) => {
      setNotification({
        message: getWsErrorMsg(event.code),
        type: "negative",
      });
    };

    data.onmessage = (message) => {
      message.data?.text().then((text: string) => {
        xtermRef.current?.terminal.write(text);
      });
    };
  };

  React.useEffect(() => {
    openWebsockets();
  }, []);

  const handleResize = () => {
    // ensure options is not undefined. fitAddon.fit will crash otherwise
    if (xtermRef.current && xtermRef.current.terminal.options === undefined) {
      xtermRef.current.terminal.options = {};
    }
    fitAddon.fit();

    const dimensions = fitAddon.proposeDimensions();
    controlWs?.send(
      textEncoder.encode(
        JSON.stringify({
          command: "window-resize",
          args: {
            height: dimensions?.rows.toString(),
            width: dimensions?.cols.toString(),
          },
        })
      )
    );
  };

  useLayoutEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [controlWs, fitAddon, xtermRef]);

  return (
    <>
      <BaseLayout
        title={`Terminal for ${name}`}
        controls={
          <Link className="p-button u-no-margin--bottom" to="/instances">
            Back
          </Link>
        }
      >
        <NotificationRow
          notification={notification}
          close={() => setNotification(null)}
        />
        <Row>
          <XTerm
            ref={xtermRef}
            addons={[fitAddon]}
            className="p-terminal"
            onData={(data) => {
              dataWs?.send(textEncoder.encode(data));
            }}
          />
        </Row>
      </BaseLayout>
    </>
  );
};

export default InstanceTerminal;
