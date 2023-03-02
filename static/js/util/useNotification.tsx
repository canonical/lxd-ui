import React, { createContext, FC, ReactNode, useEffect } from "react";
import { NotificationHelper, QueuedNotification } from "types/notification";
import { useLocation } from "react-router-dom";
import useNotificationHelper from "util/useNotificationHelper";

const initialState: NotificationHelper = {
  notification: null,
  clear: () => undefined,
  failure: () => {
    return {
      message: "",
      type: "information",
    };
  },
  success: () => {
    return {
      message: "",
      type: "information",
    };
  },
  info: () => {
    return {
      message: "",
      type: "information",
    };
  },
  queue: () => undefined,
  setDeduplicated: () => {
    return {
      message: "",
      type: "information",
    };
  },
};

export const NotifyContext = createContext<NotificationHelper>(initialState);

interface NotifyProviderProps {
  children: ReactNode;
}

const NotifyProvider: FC<NotifyProviderProps> = ({ children }) => {
  const notifyHelper = useNotificationHelper();
  const { state, pathname } = useLocation() as QueuedNotification;

  useEffect(() => {
    if (state?.queuedNotification) {
      notifyHelper.setDeduplicated(state.queuedNotification);
      window.history.replaceState({}, "");
    } else {
      notifyHelper.clear();
    }
  }, [state, pathname]);

  return (
    <NotifyContext.Provider value={notifyHelper}>
      {children}
    </NotifyContext.Provider>
  );
};

export default NotifyProvider;
