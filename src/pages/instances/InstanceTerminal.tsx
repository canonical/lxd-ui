import React, { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { XTerm } from "xterm-for-react";
import Xterm from "xterm-for-react/dist/src/XTerm";
import { FitAddon } from "xterm-addon-fit";
import { connectInstanceExec } from "api/instances";
import { getWsErrorMsg } from "util/helpers";
import useEventListener from "@use-it/event-listener";
import ReconnectTerminalBtn from "./actions/ReconnectTerminalBtn";
import { TerminalConnectPayload } from "types/terminal";
import Loader from "components/Loader";
import NotificationRowLegacy from "components/NotificationRowLegacy";
import { updateMaxHeight } from "util/updateMaxHeight";
import { LxdInstance } from "types/instance";
import SubmitButton from "components/SubmitButton";
import { useInstanceStart } from "util/instanceStart";
import {
  EmptyState,
  Icon,
  NotificationType,
  failure,
} from "@canonical/react-components";

const XTERM_OPTIONS = {
  theme: {
    background: "#292c2f",
  },
};

export const defaultPayload: TerminalConnectPayload = {
  command: "bash",
  environment: [
    {
      key: "TERM",
      value: "xterm-256color",
    },
    {
      key: "HOME",
      value: "/root",
    },
  ],
  user: 0,
  group: 0,
};

interface Props {
  instance: LxdInstance;
}

const InstanceTerminal: FC<Props> = ({ instance }) => {
  const { name, project } = useParams<{
    name: string;
    project: string;
  }>();
  const xtermRef = useRef<Xterm>(null);
  const textEncoder = new TextEncoder();
  const [inTabNotification, setInTabNotification] =
    useState<NotificationType | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [dataWs, setDataWs] = useState<WebSocket | null>(null);
  const [controlWs, setControlWs] = useState<WebSocket | null>(null);
  const [payload, setPayload] = useState(defaultPayload);
  const [fitAddon] = useState<FitAddon>(new FitAddon());

  const isRunning = instance.status === "Running";

  const openWebsockets = async (payload: TerminalConnectPayload) => {
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
        setInTabNotification(failure("Connection failed", e));
      }
    );
    if (!result) {
      return;
    }

    const operationUrl = result.operation.split("?")[0];
    const dataUrl = `wss://${location.host}${operationUrl}/websocket?secret=${result.metadata.metadata.fds["0"]}`;
    const controlUrl = `wss://${location.host}${operationUrl}/websocket?secret=${result.metadata.metadata.fds.control}`;

    const data = new WebSocket(dataUrl);
    const control = new WebSocket(controlUrl);

    control.onopen = () => {
      setLoading(false);
      setControlWs(control);
    };

    control.onerror = (e) => {
      setInTabNotification(failure("Error", e));
    };

    control.onclose = (event) => {
      if (1005 !== event.code) {
        setInTabNotification(
          failure("Error", event.reason, getWsErrorMsg(event.code))
        );
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
      setInTabNotification(failure("Error", e));
    };

    data.onclose = (event) => {
      if (1005 !== event.code) {
        setInTabNotification(
          failure("Error", event.reason, getWsErrorMsg(event.code))
        );
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
    xtermRef.current?.terminal.focus();
  }, [xtermRef.current, controlWs]);

  useEffect(() => {
    xtermRef.current?.terminal.clear();
    setInTabNotification(null);
    const websocketPromise = openWebsockets(payload);
    return () => {
      void websocketPromise.then((websockets) => {
        websockets?.map((websocket) => websocket.close());
      });
    };
  }, [payload, instance.status]);

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

  const { handleStart, isLoading: isStartLoading } = useInstanceStart(instance);

  return (
    <div className="instance-terminal-tab">
      {isRunning && (
        <>
          <div className="p-panel__controls">
            <ReconnectTerminalBtn reconnect={setPayload} payload={payload} />
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
        </>
      )}
      {!isRunning && (
        <EmptyState
          className="empty-state"
          image={<Icon name="containers" className="empty-state-icon" />}
          title="Instance stopped"
        >
          <p>Start the instance to access the terminal.</p>
          <SubmitButton
            isSubmitting={isStartLoading}
            isDisabled={false}
            buttonLabel="Start instance"
            onClick={handleStart}
          />
        </EmptyState>
      )}
    </div>
  );
};

export default InstanceTerminal;
