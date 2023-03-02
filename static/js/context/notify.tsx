import React, {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Notification,
  NotificationAction,
  NotificationHelper,
  QueuedNotification,
} from "types/notification";
import { useLocation } from "react-router-dom";
import isEqual from "lodash/isEqual";

const queue = (notification: Notification): QueuedNotification => {
  return { state: { queuedNotification: notification } };
};

const failure = (
  message: string | ReactNode,
  error: unknown,
  actions?: NotificationAction[]
): Notification => {
  return {
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
  };
};

const info = (message: string | ReactNode, title?: string): Notification => {
  return {
    message,
    title,
    type: "information",
  };
};

const success = (message: ReactNode): Notification => {
  return {
    message,
    type: "positive",
  };
};

const initialState: NotificationHelper = {
  notification: null,
  clear: () => undefined,
  failure,
  success,
  info,
  queue,
};

export const NotifyContext = createContext<NotificationHelper>(initialState);

interface NotifyProviderProps {
  children: ReactNode;
}

export const NotifyProvider: FC<NotifyProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const { state, pathname } = useLocation() as QueuedNotification;

  useEffect(() => {
    if (state?.queuedNotification) {
      setDeduplicated(state.queuedNotification);
      window.history.replaceState({}, "");
    } else {
      notification !== null && setNotification(null);
    }
  }, [state, pathname]);

  const setDeduplicated = (value: Notification) => {
    if (!isEqual(value, notification)) {
      setNotification(value);
    }
    return value;
  };

  const helper: NotificationHelper = {
    notification,
    clear: () => notification !== null && setNotification(null),
    queue,
    failure: (message, error, actions) =>
      setDeduplicated(failure(message, error, actions)),
    info: (message, title) => setDeduplicated(info(message, title)),
    success: (message) => setDeduplicated(success(message)),
  };

  return (
    <NotifyContext.Provider value={helper}>{children}</NotifyContext.Provider>
  );
};

export function useNotify() {
  return useContext(NotifyContext);
}
