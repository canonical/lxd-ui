import React, { useState } from "react";
import { Notification, NotificationHelper } from "types/notification";
import isEqual from "lodash/isEqual";

const useNotification = (): NotificationHelper => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const setDeduplicated = (newValue: Notification | null) => {
    if (!isEqual(newValue, notification)) {
      setNotification(newValue);
    }
  };

  return {
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

    clear: () => setDeduplicated(null),
  };
};

export default useNotification;
