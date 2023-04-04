import React, { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { XTerm } from "xterm-for-react";
import Xterm from "xterm-for-react/dist/src/XTerm";
import { FitAddon } from "xterm-addon-fit";
import {
  connectInstanceConsole,
  fetchInstanceConsoleBuffer,
} from "api/instances";
import { getWsErrorMsg } from "util/helpers";
import Loader from "components/Loader";
import useEventListener from "@use-it/event-listener";
import { LxdInstance } from "types/instance";
import { updateMaxHeight } from "util/updateMaxHeight";

interface Props {
  instance: LxdInstance;
  onFailure: (title: string, e: unknown, message?: string) => void;
  clearNotification: () => void;
}

const InstanceTextConsole: FC<Props> = ({
  instance,
  onFailure,
  clearNotification,
}) => {
  const { name, project } = useParams<{
    name: string;
    project: string;
  }>();
  const xtermRef = useRef<Xterm>(null);
  const textEncoder = new TextEncoder();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [textBuffer, setTextBuffer] = useState("");
  const [dataWs, setDataWs] = useState<WebSocket | null>(null);
  const [fitAddon] = useState<FitAddon>(new FitAddon());

  const openWebsockets = async () => {
    if (!name) {
      onFailure("Missing name", new Error());
      return;
    }
    if (!project) {
      onFailure("Missing project", new Error());
      return;
    }

    setLoading(true);
    fetchInstanceConsoleBuffer(name, project)
      .then(setTextBuffer)
      .catch(console.error);
    const result = await connectInstanceConsole(name, project).catch((e) => {
      setLoading(false);
      onFailure("Connection failed", e);
    });
    if (!result) {
      return;
    }

    const dataUrl = `wss://${location.host}${result.operation}/websocket?secret=${result.metadata.metadata.fds["0"]}`;
    const controlUrl = `wss://${location.host}${result.operation}/websocket?secret=${result.metadata.metadata.fds.control}`;

    const data = new WebSocket(dataUrl);
    const control = new WebSocket(controlUrl);

    control.onopen = () => {
      setLoading(false);
    };

    control.onerror = (e) => {
      onFailure("Error", e);
    };

    control.onclose = (event) => {
      if (1005 !== event.code) {
        onFailure("Error", event.reason, getWsErrorMsg(event.code));
      }
    };

    // TODO: remove this and other console.log calls
    control.onmessage = (message) => {
      console.log("control message", message);
    };

    data.onopen = () => {
      setDataWs(data);
    };

    data.onerror = (e) => {
      onFailure("Error", e);
    };

    data.onclose = (event) => {
      if (1005 !== event.code) {
        onFailure("Error", event.reason, getWsErrorMsg(event.code));
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
    if (dataWs) {
      return;
    }
    clearNotification();
    const websocketPromise = openWebsockets();
    return () => {
      void websocketPromise.then((websockets) => {
        websockets?.map((websocket) => websocket.close());
      });
    };
  }, [xtermRef, fitAddon, instance.status]);

  useEffect(() => {
    if (!textBuffer || !xtermRef.current || isLoading) {
      return;
    }
    xtermRef.current.terminal.write(textBuffer);
    setTextBuffer("");
  }, [textBuffer, xtermRef, isLoading]);

  const handleResize = () => {
    updateMaxHeight("p-terminal", undefined, 10);

    xtermRef.current?.terminal.element?.style.setProperty("padding", "1rem");

    // ensure options is not undefined. fitAddon.fit will crash otherwise
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (xtermRef.current && xtermRef.current.terminal.options === undefined) {
      xtermRef.current.terminal.options = {};
    }
    fitAddon.fit();
  };

  // calling handleResize again after a timeout to fix a race condition
  // between updateMaxHeight and fitAddon.fit
  useEventListener("resize", () => {
    handleResize();
    setTimeout(handleResize, 500);
  });
  useLayoutEffect(() => {
    handleResize();
  }, [fitAddon, xtermRef, isLoading]);

  return (
    <>
      {isLoading ? (
        <Loader text="Loading text console..." />
      ) : (
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

export default InstanceTextConsole;
