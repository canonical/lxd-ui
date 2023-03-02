import React, { useState } from "react";
import {
  Notification,
  NotificationHelper,
  QueuedNotification,
} from "types/notification";
import isEqual from "lodash/isEqual";
import { useLocation } from "react-router-dom";

const useNotificationHelper = (): NotificationHelper => {
  const location = useLocation() as QueuedNotification;
  const [notification, setNotification] = useState<Notification | null>(
    location.state?.queuedNotification ?? null
  );

  window.history.replaceState({}, "");
  const setDeduplicated = (newValue: Notification) => {
    if (!isEqual(newValue, notification)) {
      setNotification(newValue);
    }
    return newValue;
  };

  return {
    notification,

    failure: (message, error, actions = undefined) =>
      setDeduplicated({
        actions,
        message:
          error && typeof error === "object" && "message" in error ? (
            <>
              {message} {error.message}
            </>
          ) : (
            message
          ),
        type: "negative",
      }),

    info: (message, title) =>
      setDeduplicated({
        message,
        title,
        type: "information",
      }),

    success: (message) =>
      setDeduplicated({
        message,
        type: "positive",
      }),

    clear: () => notification !== null && setNotification(null),

    queue: (notification) => {
      return { state: { queuedNotification: notification } };
    },

    setDeduplicated,
  };
};

export default useNotificationHelper;
