import { NotificationSeverity } from "@canonical/react-components/dist/components/Notification/Notification";
import { ValueOf } from "@canonical/react-components/dist/types";

export interface Notification {
  message: string;
  type: ValueOf<typeof NotificationSeverity>;
}

export interface NotificationHelper {
  notification: Notification | null;
  clear: () => void;
  failure: (message: string, error: unknown) => void;
  info: (message: string) => void;
  success: (message: string) => void;
}
