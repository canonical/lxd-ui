import { FC, useEffect } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { useNotify } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";

export const MAIN_CONFIGURATION = "Main configuration";
export const DISK_DEVICES = "Disk devices";
export const NETWORK_DEVICES = "Network devices";
export const GPU_DEVICES = "GPU devices";
export const OTHER_DEVICES = "Other devices";
export const RESOURCE_LIMITS = "Resource limits";
export const SECURITY_POLICIES = "Security policies";
export const MIGRATION = "Migration";
export const SNAPSHOTS = "Snapshots";
export const CLOUD_INIT = "Cloud init";
export const YAML_CONFIGURATION = "YAML configuration";

interface Props {
  isConfigDisabled: boolean;
  active: string;
  setActive: (val: string) => void;
  hasDiskError: boolean;
  hasNetworkError: boolean;
}

const InstanceFormMenu: FC<Props> = ({
  isConfigDisabled,
  active,
  setActive,
  hasDiskError,
  hasNetworkError,
}) => {
  const notify = useNotify();
  const menuItemProps = {
    active,
    setActive,
    disableReason: isConfigDisabled
      ? "Please select an image before adding custom configuration"
      : undefined,
  };

  const resize = () => {
    updateMaxHeight("form-navigation", "p-bottom-controls");
  };
  useEffect(resize, [notify.notification?.message]);
  useEventListener("resize", resize);

  return (
    <div className="p-side-navigation--accordion form-navigation">
      <nav aria-label="Instance form navigation">
        <ul className="p-side-navigation__list">
          <MenuItem label={MAIN_CONFIGURATION} {...menuItemProps} />
          <MenuItem
            label={DISK_DEVICES}
            hasError={hasDiskError}
            {...menuItemProps}
          />
          <MenuItem
            label={NETWORK_DEVICES}
            hasError={hasNetworkError}
            {...menuItemProps}
          />
          <MenuItem label={GPU_DEVICES} {...menuItemProps} />
          <MenuItem label={OTHER_DEVICES} {...menuItemProps} />
          <MenuItem label={RESOURCE_LIMITS} {...menuItemProps} />
          <MenuItem label={SECURITY_POLICIES} {...menuItemProps} />
          <MenuItem label={SNAPSHOTS} {...menuItemProps} />
          <MenuItem label={MIGRATION} {...menuItemProps} />
          <MenuItem label={CLOUD_INIT} {...menuItemProps} />
        </ul>
      </nav>
    </div>
  );
};

export default InstanceFormMenu;
