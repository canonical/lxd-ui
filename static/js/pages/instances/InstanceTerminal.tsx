import React, { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { XTerm } from "xterm-for-react";
import Xterm from "xterm-for-react/dist/src/XTerm";
import { FitAddon } from "xterm-addon-fit";
import { fetchInstanceExec } from "api/instances";
import { getWsErrorMsg } from "util/helpers";
import useEventListener from "@use-it/event-listener";
import ReconnectTerminalBtn from "./actions/ReconnectTerminalBtn";
import { LxdTerminalPayload } from "types/terminal";
import { createPortal } from "react-dom";
import Loader from "components/Loader";
import { NotificationHelper } from "types/notification";

const defaultPayload = {
  command: ["bash"],
  "record-output": true,
  "wait-for-websocket": true,
  environment: {
    TERM: "xterm-256color",
  },
  interactive: true,
  group: 1000,
  user: 1000,
};

interface Props {
  controlTarget?: HTMLSpanElement | null;
  notify: NotificationHelper;
}

const InstanceTerminal: FC<Props> = ({ controlTarget, notify }) => {
  const { name, project } = useParams<{
    name: string;
    project: string;
  }>();
  const xtermRef = useRef<Xterm>(null);
  const textEncoder = new TextEncoder();
  const [isTerminalLoading, setTerminalLoading] = useState<boolean>(false);
  const [dataWs, setDataWs] = useState<WebSocket | null>(null);
  const [controlWs, setControlWs] = useState<WebSocket | null>(null);
  const [payload, setPayload] = useState<LxdTerminalPayload | null>(
    defaultPayload
  );

  const [fitAddon] = useState<FitAddon>(new FitAddon());

  const handleReconnect = (payload: LxdTerminalPayload) => {
    xtermRef.current?.terminal.clear();
    notify.clear();
    setPayload(payload);
  };

  const openWebsockets = async (payload: LxdTerminalPayload) => {
    if (!name) {
      notify.failure("Missing name", new Error());
      return;
    }
    if (!project) {
      notify.failure("Missing project", new Error());
      return;
    }

    setTerminalLoading(true);
    const result = await fetchInstanceExec(name, project, payload).catch(
      (e) => {
        setTerminalLoading(false);
        notify.failure("Could not open terminal session.", e);
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
      setTerminalLoading(false);
      setControlWs(control);
    };

    control.onerror = (e) => {
      notify.failure("There was an error with control websocket", e);
    };

    control.onclose = (event) => {
      if (1005 !== event.code) {
        notify.failure(getWsErrorMsg(event.code), event.reason);
      }
      setControlWs(null);
    };

    control.onmessage = (message) => {
      console.log("control message", message);
    };

    data.onopen = () => {
      setDataWs(data);
    };

    data.onerror = (e) => {
      notify.failure("There was an error with data websocket", e);
    };

    data.onclose = (event) => {
      if (1005 !== event.code) {
        notify.failure(getWsErrorMsg(event.code), event.reason);
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

  useEventListener("resize", handleResize);
  useLayoutEffect(() => {
    handleResize();
  }, [controlWs, fitAddon, xtermRef]);

  return (
    <>
      {controlTarget &&
        createPortal(
          <>
            <ReconnectTerminalBtn onFinish={handleReconnect} />
          </>,
          controlTarget
        )}
      {isTerminalLoading && <Loader text="Loading terminal session..." />}
      {controlWs && (
        <XTerm
          ref={xtermRef}
          addons={[fitAddon]}
          className="p-terminal"
          onData={(data) => {
            dataWs?.send(textEncoder.encode(data));
          }}
        />
      )}
    </>
  );
};

export default InstanceTerminal;
