import React, { FC, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Icon } from "@canonical/react-components";
import * as SpiceHtml5 from "../../../assets/lib/spice/src/main";
import { fetchInstanceVga } from "api/instances";
import { getWsErrorMsg } from "util/helpers";
import useEventListener from "@use-it/event-listener";
import { createPortal } from "react-dom";
import Loader from "components/Loader";
import { NotificationHelper } from "types/notification";

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    spice_connection?: SpiceHtml5.SpiceMainConn;
  }
}

interface Props {
  controlTarget?: HTMLSpanElement | null;
  notify: NotificationHelper;
}

const InstanceVga: FC<Props> = ({ controlTarget, notify }) => {
  const { name } = useParams<{
    name: string;
  }>();
  const spiceRef = useRef<HTMLDivElement>(null);
  const [isVgaLoading, setVgaLoading] = useState<boolean>(false);

  const handleError = (e: object) => {
    notify.failure("spice error", e);
  };

  const openVgaConsole = async () => {
    if (!name) {
      notify.failure("Missing name", new Error());

      return;
    }

    setVgaLoading(true);
    const result = await fetchInstanceVga(name).catch((e) => {
      setVgaLoading(false);
      notify.failure("Could not open vga session.", e);
    });
    if (!result) {
      return;
    }

    const dataUrl = `wss://${location.host}${result.operation}/websocket?secret=${result.metadata.metadata.fds["0"]}`;
    const controlUrl = `wss://${location.host}${result.operation}/websocket?secret=${result.metadata.metadata.fds.control}`;

    const control = new WebSocket(controlUrl);

    control.onerror = (e) => {
      notify.failure("Error on the control websocket.", e);
    };

    control.onclose = (event) => {
      notify.failure(getWsErrorMsg(event.code), event.reason);
    };

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
          SpiceHtml5.handle_resize();
        },
      });
    } catch (e) {
      notify.failure("error connecting", e);
    }

    return control;
  };

  useEventListener("resize", SpiceHtml5.handle_resize);
  useEffect(() => {
    const websocketPromise = openVgaConsole();
    return () => {
      try {
        window.spice_connection?.stop();
      } catch (e) {
        console.error(e);
      }
      void websocketPromise.then((websocket) => websocket?.close());
    };
  }, []);

  const handleFullScreen = () => {
    const container = spiceRef.current;
    if (!container) {
      return;
    }
    container
      .requestFullscreen()
      .then(SpiceHtml5.handle_resize)
      .catch((e) => {
        notify.failure("Failed to enter full-screen mode.", e);
      });
  };

  return (
    <>
      {controlTarget &&
        createPortal(
          <>
            <Button
              className="u-no-margin--bottom"
              hasIcon
              onClick={handleFullScreen}
            >
              <Icon name="fullscreen" />
              <span>Fullscreen</span>
            </Button>
          </>,
          controlTarget
        )}
      {isVgaLoading ? (
        <Loader text="Loading VGA session..." />
      ) : (
        <div id="spice-area" ref={spiceRef}>
          <div id="spice-screen" className="spice-screen" />
        </div>
      )}
    </>
  );
};

export default InstanceVga;
