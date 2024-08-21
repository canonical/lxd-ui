import { FC, useEffect } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { useNotify } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { hasDiskError, hasNetworkError } from "util/instanceValidation";
import { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";

export const MAIN_CONFIGURATION = "Main configuration";
export const DISK_DEVICES = "Disk devices";
export const NETWORK_DEVICES = "Network devices";
export const GPU_DEVICES = "GPU devices";
export const OTHER_DEVICES = "Other devices";
export const RESOURCE_LIMITS = "Resource limits";
export const SECURITY_POLICIES = "Security policies";
export const SNAPSHOTS = "Snapshots";
export const MIGRATION = "Migration";
export const CLOUD_INIT = "Cloud init";
export const YAML_CONFIGURATION = "YAML configuration";

interface Props {
  active: string;
  setActive: (val: string) => void;
  hasName: boolean;
  formik: InstanceAndProfileFormikProps;
}

const ProfileFormMenu: FC<Props> = ({ active, setActive, hasName, formik }) => {
  const notify = useNotify();

  const menuItemProps = {
    active,
    setActive,
    disableReason: hasName
      ? undefined
      : "Please enter a name before adding custom configuration",
  };

  const resize = () => {
    updateMaxHeight("form-navigation", "p-bottom-controls");
  };
  useEffect(resize, [notify.notification?.message]);
  useEventListener("resize", resize);

  return (
    <div className="p-side-navigation--accordion form-navigation">
      <nav aria-label="Profile form navigation">
        <ul className="p-side-navigation__list">
          <MenuItem label={MAIN_CONFIGURATION} {...menuItemProps} />
          <MenuItem
            label={DISK_DEVICES}
            hasError={hasDiskError(formik)}
            {...menuItemProps}
          />
          <MenuItem
            label={NETWORK_DEVICES}
            hasError={hasNetworkError(formik)}
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

export default ProfileFormMenu;
