import React, { FC, PropsWithChildren } from "react";
import { NotificationProvider as RCNotificationProvider } from "@canonical/react-components";
import { useLocation } from "react-router-dom";
import { QueuedNotification } from "@canonical/react-components";

const NotificationProvider: FC<PropsWithChildren> = ({ children }) => {
  const { state, pathname } = useLocation() as QueuedNotification;
  return (
    <RCNotificationProvider state={state} pathname={pathname}>
      {children}
    </RCNotificationProvider>
  );
};

export default NotificationProvider;
