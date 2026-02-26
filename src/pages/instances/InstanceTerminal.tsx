import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { unstable_usePrompt as usePrompt, useParams } from "react-router-dom";
import { FitAddon } from "@xterm/addon-fit";
import { connectInstanceExec } from "api/instances";
import { getWsErrorMsg } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";
import ReconnectTerminalBtn from "./actions/ReconnectTerminalBtn";
import type { TerminalConnectPayload } from "types/terminal";
import { updateMaxHeight } from "util/updateMaxHeight";
import type { LxdInstance } from "types/instance";
import { useInstanceStart } from "util/instanceStart";
import Xterm from "components/Xterm";
import type { Terminal } from "@xterm/xterm";
import type { NotificationType } from "@canonical/react-components";
import {
  ActionButton,
  EmptyState,
  Icon,
  Notification,
  useListener,
  Spinner,
  Button,
  failure,
} from "@canonical/react-components";
import { useInstanceEntitlements } from "util/entitlements/instances";
import { isInstanceRunning } from "util/instanceStatus";

const XTERM_OPTIONS = {
  theme: {
    background: "#292c2f",
  },
};

const defaultPayload: TerminalConnectPayload = {
  command: "su -l",
  environment: [
    {
      key: "TERM",
      value: "xterm-256color",
    },
    {
      key: "HOME",
      value: "/root",
    },
    {
      key: "PATH",
      value:
        "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin:/run/current-system/sw/bin",
    },
    {
      key: "LANG",
      value: "C.UTF-8",
    },
    {
      key: "USER",
      value: "root",
    },
  ],
  user: 0,
  group: 0,
};

export const UI_TERMINAL_DEFAULT_PAYLOAD = "user.ui_terminal_default_payload";

const getDefaultPayload = (instance: LxdInstance) => {
  const userPayload = instance.config[UI_TERMINAL_DEFAULT_PAYLOAD];
  if (userPayload) {
    return JSON.parse(userPayload) as TerminalConnectPayload;
  }

  return defaultPayload;
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
  const [error, setError] = useState<NotificationType | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [dataWs, setDataWs] = useState<WebSocket | null>(null);
  const [controlWs, setControlWs] = useState<WebSocket | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [payload, setPayload] = useState(getDefaultPayload(instance));
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
  useListener(window, handleCloseTab, "beforeunload");

  const openWebsockets = async (payload: TerminalConnectPayload) => {
    if (!name) {
      setError(failure("Missing name", new Error()));
      return;
    }
    if (!project) {
      setError(failure("Missing project", new Error()));
      return;
    }

    setLoading(true);
    const result = await connectInstanceExec(name, project, payload).catch(
      (e) => {
        setLoading(false);
        setError(failure("Connection failed", e));
      },
    );
    if (!result) {
      return;
    }

    const operationUrl = result.operation.split("?")[0];
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    const dataUrl = `${protocol}://${location.host}${ROOT_PATH}${operationUrl}/websocket?secret=${result.metadata.metadata.fds["0"]}`;
    const controlUrl = `${protocol}://${location.host}${ROOT_PATH}${operationUrl}/websocket?secret=${result.metadata.metadata.fds.control}`;

    const data = new WebSocket(dataUrl);
    const control = new WebSocket(controlUrl);

    control.onopen = () => {
      setLoading(false);
      setControlWs(control);
      setRefreshKey((prev) => prev + 1);
    };

    control.onerror = (e) => {
      setError(failure("Error", e));
    };

    control.onclose = (event) => {
      if (1005 !== event.code) {
        setError(failure("Error", event.reason, getWsErrorMsg(event.code)));
      }
    };

    data.onopen = () => {
      setDataWs(data);
      setRefreshKey((prev) => prev + 1);
    };

    data.onerror = (e) => {
      setError(failure("Error", e));
    };

    data.onclose = (event) => {
      if (1005 !== event.code) {
        setError(failure("Error", event.reason, getWsErrorMsg(event.code)));
      }
      setUserInteracted(false);
    };

    data.binaryType = "arraybuffer";
    data.onmessage = (message: MessageEvent<ArrayBuffer>) => {
      const isOriginMatch = message.origin === `${protocol}://${location.host}`;
      if (message.isTrusted && isOriginMatch) {
        xtermRef.current?.write(new Uint8Array(message.data));
      } else {
        console.error("Ignoring untrusted message", message);
      }
    };

    return [data, control];
  };

  const isRunning = isInstanceRunning(instance);
  const isBooting = isRunning && (instance.state?.processes ?? 0) < 1;
  const canConnect = isRunning && !isBooting;
  const displayConsole = canConnect || controlWs !== null;
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

      return () => {
        clearTimeout(timeout);
      };
    } else {
      return () => {};
    }
  }, [isBooting, version]);

  useEffect(() => {
    if (canConnect && canExec) {
      xtermRef.current?.clear();
      setError(null);
      const websocketPromise = openWebsockets(payload);
      return () => {
        void websocketPromise.then((websockets) => {
          websockets?.map((websocket) => {
            websocket.close();
          });
        });
      };
    } else {
      return () => {};
    }
  }, [payload, instance.status, canConnect, canExec]);

  const handleResize = () => {
    if (!displayConsole) {
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
  useListener(
    window,
    () => {
      handleResize();
      setTimeout(handleResize, 500);
    },
    "resize",
    true,
  );

  useListener(window, handleResize, "menu-collapse-toggle");
  useEffect(handleResize, [error?.message]);

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

  const isDisabled =
    !canUpdateInstanceState(instance) || isBooting || isStartLoading;

  const handleFullscreen = () => {
    xtermRef.current?.element
      ?.requestFullscreen()
      .then(handleResize)
      .then(() => {
        xtermRef.current?.focus();
      })
      .catch((e) => {
        setError(failure("Failed to enter full-screen mode", e));
      });
  };

  return (
    <div className="instance-terminal-tab">
      {displayConsole && (
        <>
          <div className="p-panel__controls">
            <Button
              className="u-no-margin--bottom"
              onClick={handleFullscreen}
              disabled={isLoading || !controlWs}
            >
              Fullscreen
            </Button>
            <ReconnectTerminalBtn
              reconnect={setPayload}
              payload={payload}
              instance={instance}
            />
          </div>
          {error && (
            <Notification
              title={error.title}
              severity="negative"
              onDismiss={() => {
                setError(null);
              }}
            >
              {error.message}
            </Notification>
          )}
          {isLoading && (
            <Spinner className="u-loader" text="Loading terminal session..." />
          )}
          {controlWs && (
            <Xterm
              key={refreshKey}
              ref={xtermRef}
              addons={[fitAddon]}
              options={XTERM_OPTIONS}
              onData={(data) => {
                setUserInteracted(true);
                if (dataWs?.readyState === WebSocket.CLOSED) {
                  setError(
                    failure(
                      "Failed sending command",
                      new Error(
                        "WebSocket is closed. Ensure instance is running and reconnect.",
                      ),
                    ),
                  );
                } else {
                  dataWs?.send(textEncoder.encode(data));
                }
              }}
              onOpen={handleTerminalOpen}
              className="p-terminal"
            />
          )}
        </>
      )}
      {!displayConsole && (
        <EmptyState
          className="empty-state"
          image={<Icon name="pods" className="empty-state-icon" />}
          title={isBooting ? "Instance starting" : "Instance stopped"}
        >
          <p>
            {isBooting
              ? "Terminal will be ready once the instance has finished booting."
              : "Start the instance to access the terminal."}
          </p>
          <ActionButton
            appearance="positive"
            loading={isStartLoading || isBooting}
            onClick={handleStart}
            disabled={isDisabled}
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
