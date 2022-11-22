import React, { FC } from "react";
import {
  Row,
  Notification as NotificationComponent,
} from "@canonical/react-components";
import { NotificationHelper } from "../types/notification";

type Props = {
  notify: NotificationHelper;
};

const NotificationRow: FC<Props> = ({ notify }) => {
  if (!notify.notification) {
    return null;
  }
  const { type, message } = notify.notification;
  return (
    <Row>
      <NotificationComponent severity={type} onDismiss={notify.clear}>
        {message}
      </NotificationComponent>
    </Row>
  );
};

export default NotificationRow;
