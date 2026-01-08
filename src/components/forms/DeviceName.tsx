import type { FC } from "react";
import classnames from "classnames";
import { Icon } from "@canonical/react-components";

interface Props {
  name: string;
  hasChanges?: boolean;
  isDetached?: boolean;
}

const DeviceName: FC<Props> = ({ name, hasChanges, isDetached = false }) => {
  return (
    <div className="device-header device-name u-gap--small u-flex">
      <b
        className={classnames("device-header-name", {
          "u-text--muted u-text--line-through": isDetached,
          "has-changes": hasChanges,
        })}
      >
        {name}
      </b>
      {hasChanges && (
        <Icon
          name="status-in-progress-small"
          title="This device has unsaved changes"
        />
      )}
    </div>
  );
};

export default DeviceName;
