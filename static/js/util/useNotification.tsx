import React, { useMemo, useState } from "react";
import {
  Notification,
  NotificationHelper,
  QueuedNotification,
} from "types/notification";
import isEqual from "lodash/isEqual";
import { useLocation } from "react-router-dom";

const useNotification = (): NotificationHelper => {
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

  const id = useMemo(() => (Math.random() + 1).toString(36).substring(7), []);

  return {
    id,
    notification,

    failure: (message, error) =>
      setDeduplicated({
        /* eslint-disable @typescript-eslint/no-base-to-string */
        message: error ? (
          <>
            {message} {error.toString()}
          </>
        ) : (
          message
        ),
        /* eslint-enable @typescript-eslint/no-base-to-string */
        type: "negative",
      }),

    info: (message) =>
      setDeduplicated({
        message,
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
  };
};

export default useNotification;
