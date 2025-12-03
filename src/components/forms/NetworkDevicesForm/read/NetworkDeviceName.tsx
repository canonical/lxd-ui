import type { FC } from "react";
import classnames from "classnames";

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
  const LabelTag = isInherited ? "b" : "span";

  return (
    <div className="network-device-name">
      {hasChanges && (
        <span
          className="network-device-change-indicator"
          title="This device has unsaved changes"
        />
      )}
      <LabelTag
        className={classnames("network-device-label", {
          "u-text--muted u-text--line-through": isInherited && isDetached,
          "has-changes": hasChanges,
        })}
      >
        {name}
      </LabelTag>
    </div>
  );
};

export default NetworkDeviceName;
