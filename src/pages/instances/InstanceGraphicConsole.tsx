import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import * as SpiceHtml5 from "lib/spice/src/main.js";
import { connectInstanceVga } from "api/instances";
import { getWsErrorMsg } from "util/helpers";
import { updateMaxHeight } from "util/updateMaxHeight";
import type { LxdInstance } from "types/instance";
import { useListener, useNotify, Spinner } from "@canonical/react-components";
import { isInstanceRunning } from "util/instanceStatus";
import { useMounted } from "context/useMounted";

declare global {
  interface Window {
    spice_connection?: SpiceHtml5.SpiceMainConn;
  }
}

interface SpiceWheelEvent extends CustomEvent {
  detail: {
    wheelEvent: WheelEvent;
  };
}

interface Props {
  instance: LxdInstance;
  onMount: (handler: () => void) => void;
  onFailure: (title: string, e: unknown, message?: string) => void;
}

const InstanceGraphicConsole: FC<Props> = ({
  instance,
  onMount,
  onFailure,
}) => {
  const { name, project } = useParams<{
    name: string;
    project: string;
  }>();
  const notify = useNotify();
  const spiceRef = useRef<HTMLDivElement>(null);
  const [isVgaLoading, setVgaLoading] = useState<boolean>(false);
  const isMounted = useMounted();

  const isRunning = isInstanceRunning(instance);

  const handleError = (e: object, message?: string) => {
    if (isMounted.current) {
      onFailure("Console error", e, message);
    }
  };

  const handleResize = () => {
    updateMaxHeight("spice-wrapper");
    SpiceHtml5.handle_resize();
  };

  const openVgaConsole = async () => {
    if (!name) {
      onFailure("Missing name", new Error());
      return;
    }
    if (!project) {
      onFailure("Missing project", new Error());
      return;
    }

    setVgaLoading(true);
    const result = await connectInstanceVga(name, project).catch((e) => {
      setVgaLoading(false);
      if (isRunning) {
        onFailure("Connection failed", e);
      }
    });
    if (!result) {
      return;
    }

    const operationUrl = result.operation.split("?")[0];
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    const dataUrl = `${protocol}://${location.host}${operationUrl}/websocket?secret=${result.metadata.metadata.fds["0"]}`;
    const controlUrl = `${protocol}://${location.host}${operationUrl}/websocket?secret=${result.metadata.metadata.fds.control}`;

    const control = new WebSocket(controlUrl);

    control.onerror = handleError;

    control.onclose = (event) => {
      if (1005 !== event.code && isMounted.current) {
        onFailure("Console error", event.reason, getWsErrorMsg(event.code));
      }
    };

    // TODO: remove this and other console.log calls
    control.onmessage = (message) => {
      console.log("control message", message);
    };

    try {
      window.spice_connection = new SpiceHtml5.SpiceMainConn({
        uri: dataUrl,
        screen_id: "spice-screen",
        onerror: handleError,
        onsuccess: () => {
          setVgaLoading(false);
          handleResize();
        },
        onagent: handleResize,
      });
    } catch (e) {
      if (isRunning) {
        onFailure("Connection failed", e);
      }
    }

    return control;
  };

  useListener(window, handleResize, "resize", true);
  useEffect(handleResize, [notify.notification?.message]);

  useListener(
    window,
    (e) => {
      if (!spiceRef.current?.parentElement || !("detail" in e)) {
        return;
      }
      const wheelEvent = (e as unknown as SpiceWheelEvent).detail.wheelEvent;
      spiceRef.current.parentElement.scrollBy(
        wheelEvent.deltaX,
        wheelEvent.deltaY,
      );
    },
    "spice-wheel",
  );

  useEffect(() => {
    notify.clear();
    const websocketPromise = openVgaConsole();
    return () => {
      try {
        window.spice_connection?.stop();
      } catch (e) {
        console.error(e);
      }
      void websocketPromise.then((websocket) => websocket?.close());
    };
  }, [instance.status]);

  const handleFullScreen = () => {
    const container = spiceRef.current;
    if (!container) {
      return;
    }
    container
      .requestFullscreen()
      .then(handleResize)
      .catch((e) => {
        onFailure("Failed to enter full-screen mode", e);
      });
  };
  onMount(handleFullScreen);

  return (
    <>
      {isVgaLoading ? (
        <Spinner className="u-loader" text="Loading VGA session..." />
      ) : (
        <div id="spice-area" ref={spiceRef}>
          <div id="spice-screen" className="spice-screen" />
        </div>
      )}
    </>
  );
};

export default InstanceGraphicConsole;
