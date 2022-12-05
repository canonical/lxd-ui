import React, { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { XTerm } from "xterm-for-react";
import Xterm from "xterm-for-react/dist/src/XTerm";
import { FitAddon } from "xterm-addon-fit";
import { fetchInstanceExec } from "./api/instances";
import NotificationRow from "./components/NotificationRow";
import { getWsErrorMsg } from "./util/helpers";
import useEventListener from "@use-it/event-listener";
import useNotification from "./util/useNotification";

const InstanceTerminal: FC = () => {
  const { name } = useParams<{
    name: string;
  }>();
  const xtermRef = useRef<Xterm>(null);
  const textEncoder = new TextEncoder();
  const [dataWs, setDataWs] = useState<WebSocket | null>(null);
  const [controlWs, setControlWs] = useState<WebSocket | null>(null);
  const notify = useNotification();

  const [fitAddon] = useState<FitAddon>(new FitAddon());

  const openWebsockets = async () => {
    if (!name) {
      return;
    }

    const result = await fetchInstanceExec(name);

    const dataUrl = `wss://${location.host}${result.operation}/websocket?secret=${result.metadata.metadata.fds["0"]}`;
    const controlUrl = `wss://${location.host}${result.operation}/websocket?secret=${result.metadata.metadata.fds.control}`;

    const data = new WebSocket(dataUrl);
    const control = new WebSocket(controlUrl);

    control.onopen = () => {
      setControlWs(control);
    };

    control.onerror = (e) => {
      notify.failure("There was an error with control websocket", e);
    };

    control.onclose = (event) => {
      notify.failure(getWsErrorMsg(event.code), event);
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
      notify.failure(getWsErrorMsg(event.code), event);
      setDataWs(null);
    };

    data.onmessage = (message: MessageEvent<Blob | null>) => {
      void message.data?.text().then((text: string) => {
        xtermRef.current?.terminal.write(text);
      });
    };

    return [data, control];
  };

  useEffect(() => {
    const websocketPromise = openWebsockets();
    return () => {
      void websocketPromise.then((websockets) => {
        websockets?.map((websocket) => websocket.close());
      });
    };
  }, []);

  const handleResize = () => {
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
      <NotificationRow notify={notify} />
      <XTerm
        ref={xtermRef}
        addons={[fitAddon]}
        className="p-terminal"
        onData={(data) => {
          dataWs?.send(textEncoder.encode(data));
        }}
      />
    </>
  );
};

export default InstanceTerminal;
