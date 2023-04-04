import { NotificationSeverity } from "@canonical/react-components/dist/components/Notification/Notification";
import { ValueOf } from "@canonical/react-components/dist/types";
import { ReactNode } from "react";

interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface Notification {
  actions?: NotificationAction[];
  message: string | ReactNode;
  title?: string;
  type: ValueOf<typeof NotificationSeverity>;
}

export interface QueuedNotification {
  state?: {
    queuedNotification: Notification | null;
  };
  pathname?: string;
}

export interface NotificationHelper {
  notification: Notification | null;
  clear: () => void;
  failure: (
    title: string,
    error: unknown,
    message?: string | ReactNode,
    actions?: NotificationAction[]
  ) => Notification;
  info: (message: string | ReactNode, title?: string) => Notification;
  success: (message: string | ReactNode) => Notification;
  queue: (notification: Notification) => QueuedNotification;
}
