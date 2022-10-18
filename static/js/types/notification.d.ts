import { NotificationSeverity } from "@canonical/react-components/dist/components/Notification/Notification";
import { ValueOf } from "@canonical/react-components/dist/types";

export interface Notification {
  message: string;
  type: ValueOf<typeof NotificationSeverity>;
};