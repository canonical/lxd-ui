import {
  NotificationProvider,
  QueuedNotification,
} from "@canonical/react-components";
import { FC, PropsWithChildren } from "react";
import ToastNotificationProvider from "./toastNotificationProvider";

const CombinedNotificationProvider: FC<
  PropsWithChildren<{ state: QueuedNotification["state"]; pathname?: string }>
> = ({ children, state, pathname }) => {
  return (
    <ToastNotificationProvider>
      <NotificationProvider state={state} pathname={pathname}>
        {children}
      </NotificationProvider>
    </ToastNotificationProvider>
  );
};

export default CombinedNotificationProvider;
