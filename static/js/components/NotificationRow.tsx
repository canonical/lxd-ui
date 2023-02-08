import React, { FC, useEffect, useRef } from "react";
import {
  Row,
  Notification as NotificationComponent,
  Button,
} from "@canonical/react-components";
import { NotificationHelper } from "types/notification";
import toast, { Toaster } from "react-hot-toast";

const makeToast = () =>
  toast.custom(
    <NotificationComponent
      severity="positive"
      onDismiss={() => toast.remove()}
      style={{ maxWidth: "40rem", marginRight: "1.4rem", marginTop: "3rem" }}
      title="New instance created"
    >
      You have successfully launched <a href="/">lunar-lobster</a>
    </NotificationComponent>,
    {
      duration: 30000,
      position: "top-right",
    }
  );

const makeToastError = () =>
  toast.custom(
    <NotificationComponent
      severity="negative"
      onDismiss={() => toast.remove()}
      style={{ maxWidth: "40rem", marginRight: "1.4rem", marginTop: "3rem" }}
      title="Instance creation failed"
    >
      We were not able to create the requested instance.
      <hr />
      <Button appearance="link" className="u-float-right">
        Try again
      </Button>
    </NotificationComponent>,
    {
      duration: Infinity,
      position: "top-right",
    }
  );

const makeToastCenter = () =>
  toast.custom(
    <NotificationComponent
      severity="positive"
      onDismiss={() => toast.remove()}
      style={{ maxWidth: "40rem" }}
      title="New instance created"
    >
      You have successfully launched <a href="/">lunar-lobster</a>
    </NotificationComponent>,
    {
      duration: 2000,
    }
  );

const makeToastErrorCenter = () =>
  toast.custom(
    <NotificationComponent
      severity="negative"
      onDismiss={() => toast.remove()}
      style={{ maxWidth: "40rem" }}
      title="Instance creation failed"
    >
      We were not able to create the requested instance.
      <hr />
      <Button appearance="link" className="u-float-right">
        Try again
      </Button>
    </NotificationComponent>,
    {
      duration: Infinity,
    }
  );

interface Props {
  notify: NotificationHelper;
}

const NotificationRow: FC<Props> = ({ notify }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "start",
    });
    window.dispatchEvent(new Event("resize"));
  }, [notify.notification]);

  if (!notify.notification) {
    return (
      <div>
        <button onClick={makeToast}>Make me a toast</button>
        <button onClick={makeToastError}>Make me an error</button>
        <button onClick={makeToastCenter}>Make me an toast center</button>
        <button onClick={makeToastErrorCenter}>Make me an error center</button>
        <Toaster />
      </div>
    );
  }
  const { type, message } = notify.notification;
  return (
    <div ref={ref}>
      <Row>
        <NotificationComponent severity={type} onDismiss={notify.clear}>
          {message}
        </NotificationComponent>
      </Row>
    </div>
  );
};

export default NotificationRow;
