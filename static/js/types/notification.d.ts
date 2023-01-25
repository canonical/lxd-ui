import { NotificationSeverity } from "@canonical/react-components/dist/components/Notification/Notification";
import { ValueOf } from "@canonical/react-components/dist/types";
import { ReactNode } from "react";

export interface Notification {
  message: string | ReactNode;
  type: ValueOf<typeof NotificationSeverity>;
}

export interface NotificationHelper {
  id: string;
  notification: Notification | null;
  clear: () => void;
  failure: (message: string | ReactNode, error: unknown) => Notification | null;
  info: (message: string | ReactNode) => Notification | null;
  success: (message: string | ReactNode) => Notification | null;
}
