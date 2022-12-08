import React, { FC, useEffect, useRef } from "react";
import {
  Row,
  Notification as NotificationComponent,
} from "@canonical/react-components";
import { NotificationHelper } from "../types/notification";

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
    return null;
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
