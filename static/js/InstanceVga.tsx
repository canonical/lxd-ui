import React, { FC, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Icon, Row } from "@canonical/react-components";
import NotificationRow from "./components/NotificationRow";
import * as SpiceHtml5 from "../assets/lib/spice/src/main";
import { fetchInstanceVga } from "./api/instances";
import { getWsErrorMsg } from "./util/helpers";
import BaseLayout from "./components/BaseLayout";
import useEventListener from "@use-it/event-listener";
import useNotification from "./util/useNotification";

type Params = {
  name: string;
};

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    spice_connection?: any;
  }
}

const InstanceVga: FC = () => {
  const { name } = useParams<Params>();
  const notify = useNotification();
  const spiceRef = useRef<HTMLDivElement>(null);

  const handleError = (e: object) => {
    notify.failure("spice error", e);
  };

  const openVgaConsole = async () => {
    if (!name) {
      notify.failure("Missing name", new Error());

      return;
    }

    const result = await fetchInstanceVga(name).catch((e) => {
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
      notify.failure(getWsErrorMsg(event.code), event);
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
          SpiceHtml5.handle_resize();
        },
      });
    } catch (e) {
      notify.failure("error connecting", e);
    }
  };

  useEventListener("resize", SpiceHtml5.handle_resize);
  React.useEffect(() => {
    openVgaConsole();
  }, []);

  const handleFullScreen = () => {
    const container = spiceRef.current;
    if (!container) {
      return;
    }
    container
      .requestFullscreen()
      .then(SpiceHtml5.handle_resize)
      .catch((err) => {
        notify.failure("Failed to enter full-screen mode.", err);
      });
  };

  return (
    <>
      <BaseLayout
        title={`VGA Terminal for ${name}`}
        controls={
          <>
            <Button
              hasIcon={true}
              appearance="neutral"
              onClick={handleFullScreen}
            >
              <Icon name="fullscreen" />
              <span>Fullscreen</span>
            </Button>
            <Link className="p-button u-no-margin--bottom" to="/instances">
              Back
            </Link>
          </>
        }
      >
        <NotificationRow notify={notify} />
        <Row>
          <div id="spice-area" ref={spiceRef}>
            <div id="spice-screen" className="spice-screen" />
          </div>
        </Row>
      </BaseLayout>
    </>
  );
};

export default InstanceVga;
