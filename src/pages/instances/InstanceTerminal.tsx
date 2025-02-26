import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { unstable_usePrompt as usePrompt, useParams } from "react-router-dom";
import { FitAddon } from "xterm-addon-fit";
import { connectInstanceExec } from "api/instances";
import { getWsErrorMsg } from "util/helpers";
import useEventListener from "util/useEventListener";
import ReconnectTerminalBtn from "./actions/ReconnectTerminalBtn";
import type { TerminalConnectPayload } from "types/terminal";
import Loader from "components/Loader";
import { updateMaxHeight } from "util/updateMaxHeight";
import type { LxdInstance } from "types/instance";
import { useInstanceStart } from "util/instanceStart";
import Xterm from "components/Xterm";
import type { Terminal } from "xterm";
import {
  ActionButton,
  EmptyState,
  Icon,
  Notification,
  useNotify,
} from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import { useInstanceEntitlements } from "util/entitlements/instances";

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
  refreshInstance: () => Promise<unknown>;
}

const InstanceTerminal: FC<Props> = ({ instance, refreshInstance }) => {
  const { name, project } = useParams<{
    name: string;
    project: string;
  }>();
  const textEncoder = new TextEncoder();
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const [dataWs, setDataWs] = useState<WebSocket | null>(null);
  const [controlWs, setControlWs] = useState<WebSocket | null>(null);
  const [payload, setPayload] = useState(defaultPayload);
  const [fitAddon] = useState<FitAddon>(new FitAddon());
  const [userInteracted, setUserInteracted] = useState(false);
  const xtermRef = useRef<Terminal>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [version, setVersion] = useState(0);
  const { canUpdateInstanceState, canExecInstance } = useInstanceEntitlements();

  usePrompt({
    when: userInteracted,
    message: "Are you sure you want to leave this page?",
  });

  const handleCloseTab = (e: BeforeUnloadEvent) => {
    if (userInteracted) {
      e.returnValue = "Are you sure you want to leave this page?";
    }
  };
  useEventListener("beforeunload", handleCloseTab);

  const openWebsockets = async (payload: TerminalConnectPayload) => {
    if (!name) {
      notify.failure("Missing name", new Error());
      return;
    }
    if (!project) {
      notify.failure("Missing project", new Error());
      return;
    }

    setLoading(true);
    const result = await connectInstanceExec(name, project, payload).catch(
      (e) => {
        setLoading(false);
        notify.failure("Connection failed", e);
      },
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
      notify.failure("Error", e);
    };

    control.onclose = (event) => {
      if (1005 !== event.code) {
        notify.failure("Error", event.reason, getWsErrorMsg(event.code));
      }
      setControlWs(null);
    };

    data.onopen = () => {
      setDataWs(data);
    };

    data.onerror = (e) => {
      notify.failure("Error", e);
    };

    data.onclose = (event) => {
      if (1005 !== event.code) {
        notify.failure("Error", event.reason, getWsErrorMsg(event.code));
      }
      setDataWs(null);
      setUserInteracted(false);
    };

    data.binaryType = "arraybuffer";
    data.onmessage = (message: MessageEvent<ArrayBuffer>) => {
      xtermRef.current?.write(new Uint8Array(message.data));
    };

    return [data, control];
  };

  const isRunning = instance.status === "Running";
  const isBooting = isRunning && (instance.state?.processes ?? 0) < 1;
  const canConnect = isRunning && !isBooting;
  const canExec = canExecInstance(instance);

  useEffect(() => {
    if (isBooting && refreshTimerRef.current === null) {
      const delay = 1000;
      const triggerRefresh = () => {
        void refreshInstance();
        refreshTimerRef.current = null;
        setVersion((old) => old + 1);
      };
      const timeout = setTimeout(triggerRefresh, delay);
      refreshTimerRef.current = timeout;

      return () => clearTimeout(timeout);
    }
  }, [isBooting, version]);

  useEffect(() => {
    xtermRef.current?.clear();
    notify.clear();
    if (canConnect && canExec) {
      const websocketPromise = openWebsockets(payload);
      return () => {
        void websocketPromise.then((websockets) => {
          websockets?.map((websocket) => websocket.close());
        });
      };
    }
  }, [payload, instance.status, canConnect, canExec]);

  const handleResize = () => {
    if (controlWs?.readyState === WebSocket.CLOSED) {
      return;
    }

    updateMaxHeight("p-terminal", undefined, 10);

    xtermRef.current?.element?.style.setProperty("padding", "1rem");
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
        }),
      ),
    );
  };

  // calling handleResize again after a timeout to fix a race condition
  // between updateMaxHeight and fitAddon.fit
  useEventListener("resize", () => {
    handleResize();
    setTimeout(handleResize, 500);
  });

  const handleTerminalOpen = () => {
    handleResize();
    xtermRef.current?.focus();
  };

  const { handleStart, isLoading: isStartLoading } = useInstanceStart(instance);

  if (!canExec) {
    return (
      <Notification severity="caution" title="Restricted permissions">
        You do not have permission to use the terminal for this instance.
      </Notification>
    );
  }

  return (
    <div className="instance-terminal-tab">
      {canConnect && (
        <>
          <div className="p-panel__controls">
            <ReconnectTerminalBtn reconnect={setPayload} payload={payload} />
          </div>
          <NotificationRow />
          {isLoading && <Loader text="Loading terminal session..." />}
          {controlWs && (
            <Xterm
              ref={xtermRef}
              addons={[fitAddon]}
              options={XTERM_OPTIONS}
              onData={(data) => {
                setUserInteracted(true);
                dataWs?.send(textEncoder.encode(data));
              }}
              onOpen={handleTerminalOpen}
              className="p-terminal"
            />
          )}
        </>
      )}
      {!canConnect && (
        <EmptyState
          className="empty-state"
          image={<Icon name="pods" className="empty-state-icon" />}
          title={isBooting ? "Instance starting" : "Instance stopped"}
        >
          <p>
            {isBooting
              ? "Terminal will be ready once the instance is finished booting."
              : "Start the instance to access the terminal."}
          </p>
          <ActionButton
            appearance="positive"
            loading={isStartLoading || isBooting}
            onClick={handleStart}
            disabled={!canUpdateInstanceState(instance)}
            title={
              canUpdateInstanceState(instance)
                ? ""
                : "You do not have permission to start this instance."
            }
          >
            Start instance
          </ActionButton>
        </EmptyState>
      )}
    </div>
  );
};

export default InstanceTerminal;
