import React from "react";
import {
  Row,
  Notification as NotificationComponent,
} from "@canonical/react-components";
import { ValueOf } from "@canonical/react-components/dist/types";
import { NotificationSeverity } from "@canonical/react-components/dist/components/Notification/Notification";

export type Notification = {
  message: string;
  type: ValueOf<typeof NotificationSeverity>;
} | null;

type Props = {
  notification: Notification;
  close: () => void;
};

const NotificationRow = ({ notification, close }: Props) => {
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
