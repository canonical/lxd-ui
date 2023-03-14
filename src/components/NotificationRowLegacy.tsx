import React, { FC, useEffect, useRef } from "react";
import {
  Row,
  Notification as NotificationComponent,
} from "@canonical/react-components";
import { Notification } from "types/notification";

interface Props {
  notification: Notification | null;
  onDismiss: () => void;
}

const NotificationRowLegacy: FC<Props> = ({
  notification = null,
  onDismiss,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "start",
    });
    window.dispatchEvent(new Event("resize"));
  }, [notification]);

  if (!notification) {
    return null;
  }
  const { actions, title, type, message } = notification;
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
          onDismiss={onDismiss}
        >
          {message}
        </NotificationComponent>
      </Row>
    </div>
  );
};

export default NotificationRowLegacy;
