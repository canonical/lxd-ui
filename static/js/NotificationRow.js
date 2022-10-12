import React from "react";
import { Row, Notification } from "@canonical/react-components";
import PropTypes from "prop-types";

const NotificationRow = ({ notification, close }) => {
  if (!notification) {
    return null;
  }
  return (
    <Row>
      <Notification severity={notification.type} onDismiss={close}>
        {notification.message}
      </Notification>
    </Row>
  );
};

NotificationRow.propTypes = {
  close: PropTypes.func,
  notification: PropTypes.shape({
    message: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  }),
};

export default NotificationRow;
