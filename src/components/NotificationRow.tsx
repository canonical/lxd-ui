import React, { FC } from "react";
import {
  Row,
  NotificationConsumer,
  Notification as NotificationComponent,
  Button,
  useNotify,
} from "@canonical/react-components";
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
    },
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
    },
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
    },
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
    },
  );

const NotificationRow: FC = () => {
  const notify = useNotify();

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

  return (
    <Row>
      <NotificationConsumer />
    </Row>
  );
};

export default NotificationRow;
