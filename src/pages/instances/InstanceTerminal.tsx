import React, { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { XTerm } from "xterm-for-react";
import Xterm from "xterm-for-react/dist/src/XTerm";
import { FitAddon } from "xterm-addon-fit";
import { connectInstanceExec } from "api/instances";
import { getWsErrorMsg } from "util/helpers";
import useEventListener from "@use-it/event-listener";
import ReconnectTerminalBtn from "./actions/ReconnectTerminalBtn";
import { LxdTerminalPayload } from "types/terminal";
import Loader from "components/Loader";
import { Notification } from "types/notification";
import NotificationRowLegacy from "components/NotificationRowLegacy";
import { failure } from "context/notify";
import { updateMaxHeight } from "util/updateMaxHeight";

const XTERM_OPTIONS = {
  theme: {
    background: "#292c2f",
  },
};

const defaultPayload = {
  command: ["bash"],
  "record-output": true,
  "wait-for-websocket": true,
  environment: {
    TERM: "xterm-256color",
    HOME: "/root",
  },
  interactive: true,
  group: 0,
  user: 0,
};

const InstanceTerminal: FC = () => {
  const { name, project } = useParams<{
    name: string;
    project: string;
  }>();
  const xtermRef = useRef<Xterm>(null);
  const textEncoder = new TextEncoder();
  const [inTabNotification, setInTabNotification] =
    useState<Notification | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [dataWs, setDataWs] = useState<WebSocket | null>(null);
  const [controlWs, setControlWs] = useState<WebSocket | null>(null);
  const [payload, setPayload] = useState<LxdTerminalPayload | null>(
    defaultPayload
  );

  const [fitAddon] = useState<FitAddon>(new FitAddon());

  const handleReconnect = (payload: LxdTerminalPayload) => {
    xtermRef.current?.terminal.clear();
    setInTabNotification(null);
    setPayload(payload);
  };

  const openWebsockets = async (payload: LxdTerminalPayload) => {
    if (!name) {
      setInTabNotification(failure("Missing name", new Error()));
      return;
    }
    if (!project) {
      setInTabNotification(failure("Missing project", new Error()));
      return;
    }

    setLoading(true);
    const result = await connectInstanceExec(name, project, payload).catch(
      (e) => {
        setLoading(false);
        setInTabNotification(failure("Could not open terminal session.", e));
      }
    );
    if (!result) {
      return;
    }

    const dataUrl = `wss://${location.host}${result.operation}/websocket?secret=${result.metadata.metadata.fds["0"]}`;
    const controlUrl = `wss://${location.host}${result.operation}/websocket?secret=${result.metadata.metadata.fds.control}`;

    const data = new WebSocket(dataUrl);
    const control = new WebSocket(controlUrl);

    control.onopen = () => {
      setLoading(false);
      setControlWs(control);
    };

    control.onerror = (e) => {
      setInTabNotification(
        failure("There was an error with the control websocket", e)
      );
    };

    control.onclose = (event) => {
      if (1005 !== event.code) {
        setInTabNotification(failure(getWsErrorMsg(event.code), event.reason));
      }
      setControlWs(null);
    };

    // TODO: remove this and other console.log calls
    control.onmessage = (message) => {
      console.log("control message", message);
    };

    data.onopen = () => {
      setDataWs(data);
    };

    data.onerror = (e) => {
      setInTabNotification(
        failure("There was an error with data websocket", e)
      );
    };

    data.onclose = (event) => {
      if (1005 !== event.code) {
        setInTabNotification(failure(getWsErrorMsg(event.code), event.reason));
      }
      setDataWs(null);
    };

    data.onmessage = (message: MessageEvent<Blob | string | null>) => {
      if (typeof message.data === "string") {
        xtermRef.current?.terminal.write(message.data);
        return;
      }
      void message.data?.text().then((text: string) => {
        xtermRef.current?.terminal.write(text);
      });
    };

    return [data, control];
  };

  useEffect(() => {
    if (!payload) {
      return;
    }
    const websocketPromise = openWebsockets(payload);
    return () => {
      void websocketPromise.then((websockets) => {
        websockets?.map((websocket) => websocket.close());
      });
    };
  }, [payload]);

  const handleResize = () => {
    if (controlWs?.readyState === WebSocket.CLOSED) {
      return;
    }

    updateMaxHeight("p-terminal", undefined, 10);

    xtermRef.current?.terminal.element?.style.setProperty("padding", "1rem");

    // ensure options is not undefined. fitAddon.fit will crash otherwise
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

  // calling handleResize again after a timeout to fix a race condition
  // between updateMaxHeight and fitAddon.fit
  useEventListener("resize", () => {
    handleResize();
    setTimeout(handleResize, 500);
  });
  useLayoutEffect(() => {
    handleResize();
  }, [controlWs, fitAddon, xtermRef]);

  return (
    <div className="instance-terminal-tab">
      <div className="p-panel__controls">
        <ReconnectTerminalBtn onFinish={handleReconnect} />
      </div>
      <NotificationRowLegacy
        notification={inTabNotification}
        onDismiss={() => setInTabNotification(null)}
      />
      {isLoading && <Loader text="Loading terminal session..." />}
      {controlWs && (
        <XTerm
          ref={xtermRef}
          addons={[fitAddon]}
          className="p-terminal"
          onData={(data) => {
            dataWs?.send(textEncoder.encode(data));
          }}
          options={XTERM_OPTIONS}
        />
      )}
    </div>
  );
};

export default InstanceTerminal;
