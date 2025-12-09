import type { FC } from "react";
import classnames from "classnames";
import { Icon } from "@canonical/react-components";

interface Props {
  name: string;
  hasChanges?: boolean;
  isDetached?: boolean;
  isInherited?: boolean;
}

const NetworkDeviceName: FC<Props> = ({
  name,
  hasChanges,
  isDetached,
  isInherited,
}) => {
  return (
    <div className="network-device-name">
      {hasChanges && (
        <Icon
          name="status-in-progress-small"
          title="This device has unsaved changes"
        />
      )}
      <b
        className={classnames("network-device-label", {
          "u-text--muted u-text--line-through": isInherited && isDetached,
          "has-changes": hasChanges,
        })}
      >
        {name}
      </b>
    </div>
  );
};

export default NetworkDeviceName;
