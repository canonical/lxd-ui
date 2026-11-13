import type { FC } from "react";
import { Notification } from "@canonical/react-components";

const UnreadableCustomDiskDevicesWarning: FC = () => {
  return (
    <Notification severity="caution" title="Custom disk devices unknown">
      Could not read the custom disk devices recorded for this snapshot. Only
      the instance snapshot will be affected.
    </Notification>
  );
};

export default UnreadableCustomDiskDevicesWarning;
