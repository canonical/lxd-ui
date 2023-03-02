import React, { FC, useEffect, useRef } from "react";
import {
  Row,
  Notification as NotificationComponent,
} from "@canonical/react-components";
import { useNotify } from "context/notify";

const NotificationRow: FC = () => {
  const notify = useNotify();
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
    return null;
  }
  const { actions, title, type, message } = notify.notification;
  const figureTitle = () => {
    if (title) {
      return title;
    }
    switch (type) {
      case "negative":
        return "Error";
      case "positive":
        return "Success";
      case "information":
        return "Info";
      default:
        return "";
    }
  };
  return (
    <div ref={ref}>
      <Row>
        <NotificationComponent
          title={figureTitle() || undefined}
          actions={actions}
          severity={type}
          onDismiss={notify.clear}
        >
          {message}
        </NotificationComponent>
      </Row>
    </div>
  );
};

export default NotificationRow;
