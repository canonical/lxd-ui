import { useState } from "react";
import { Notification, NotificationHelper } from "../types/notification";

const useNotification = (): NotificationHelper => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const setDeduplicated = (newValue: Notification | null) => {
    const isEqual = require("lodash.isequal");
    if (!isEqual(newValue, notification)) {
      setNotification(newValue);
    }
  };

  return {
    notification,

    failure: (message, error) =>
      setDeduplicated({
        message: error ? `${message} ${error.toString()}` : message,
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
