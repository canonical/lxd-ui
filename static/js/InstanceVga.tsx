import React, {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useEffect,
  useRef,
} from "react";
import { useParams } from "react-router-dom";
import { Button, Icon } from "@canonical/react-components";
import NotificationRow from "./components/NotificationRow";
import * as SpiceHtml5 from "../assets/lib/spice/src/main";
import { fetchInstanceVga } from "./api/instances";
import { getWsErrorMsg } from "./util/helpers";
import useEventListener from "@use-it/event-listener";
import useNotification from "./util/useNotification";

type Params = {
  name: string;
};

type Props = {
  setControls: Dispatch<SetStateAction<ReactNode>>;
};

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    spice_connection?: any;
  }
}

const InstanceVga: FC<Props> = ({ setControls }) => {
  const { name } = useParams<Params>();
  const notify = useNotification();
  const spiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setControls(
      <Button hasIcon={true} appearance="neutral" onClick={handleFullScreen}>
        <Icon name="fullscreen" />
        <span>Fullscreen</span>
      </Button>
    );
  }, []);

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
      <NotificationRow notify={notify} />
      <div id="spice-area" ref={spiceRef}>
        <div id="spice-screen" className="spice-screen" />
      </div>
    </>
  );
};

export default InstanceVga;
