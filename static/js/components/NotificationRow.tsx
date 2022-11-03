import React, { FC } from "react";
import {
  Row,
  Notification as NotificationComponent,
} from "@canonical/react-components";
import { Notification } from "../types/notification";

type Props = {
  notification: Notification | null;
  close: () => void;
};

const NotificationRow: FC<Props> = ({ notification, close }) => {
  if (!notification) {
    return null;
  }
  return (
    <Row>
      <NotificationComponent severity={notification.type} onDismiss={close}>
        {notification.message}
      </NotificationComponent>
    </Row>
  );
};

export default NotificationRow;
