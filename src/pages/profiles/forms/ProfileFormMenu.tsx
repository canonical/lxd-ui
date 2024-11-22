import { FC, useEffect, useState } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { Button, useNotify } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "util/useEventListener";
import { hasDiskError, hasNetworkError } from "util/instanceValidation";
import { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import { useSupportedFeatures } from "context/useSupportedFeatures";

export const MAIN_CONFIGURATION = "Main configuration";
export const DISK_DEVICES = "Disk";
export const NETWORK_DEVICES = "Network";
export const GPU_DEVICES = "GPU";
export const PROXY_DEVICES = "Proxy";
export const OTHER_DEVICES = "Other";
export const RESOURCE_LIMITS = "Resource limits";
export const SECURITY_POLICIES = "Security policies";
export const SNAPSHOTS = "Snapshots";
export const MIGRATION = "Migration";
export const BOOT = "Boot";
export const CLOUD_INIT = "Cloud init";
export const YAML_CONFIGURATION = "YAML configuration";

interface Props {
  active: string;
  setActive: (val: string) => void;
  isDisabled: boolean;
  formik: InstanceAndProfileFormikProps;
}

const ProfileFormMenu: FC<Props> = ({
  active,
  setActive,
  isDisabled,
  formik,
}) => {
  const notify = useNotify();
  const [isDeviceExpanded, setDeviceExpanded] = useState(true);
  const { hasMetadataConfiguration } = useSupportedFeatures();

  const disableReason = isDisabled
    ? "Please enter a name before adding custom configuration"
    : undefined;

  const menuItemProps = {
    active,
    setActive,
    disableReason,
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
          <li className="p-side-navigation__item">
            <Button
              type="button"
              className="p-side-navigation__accordion-button"
              aria-expanded={isDeviceExpanded ? "true" : "false"}
              onClick={() => {
                if (!isDisabled) {
                  setDeviceExpanded(!isDeviceExpanded);
                }
              }}
              disabled={isDisabled}
              title={disableReason}
            >
              Devices
            </Button>
            <ul
              className="p-side-navigation__list"
              aria-expanded={isDeviceExpanded ? "true" : "false"}
            >
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
              <MenuItem label={PROXY_DEVICES} {...menuItemProps} />
              {hasMetadataConfiguration && (
                <MenuItem label={OTHER_DEVICES} {...menuItemProps} />
              )}
            </ul>
          </li>
          <MenuItem label={RESOURCE_LIMITS} {...menuItemProps} />
          <MenuItem label={SECURITY_POLICIES} {...menuItemProps} />
          <MenuItem label={SNAPSHOTS} {...menuItemProps} />
          <MenuItem label={MIGRATION} {...menuItemProps} />
          <MenuItem label={BOOT} {...menuItemProps} />
          <MenuItem label={CLOUD_INIT} {...menuItemProps} />
        </ul>
      </nav>
    </div>
  );
};

export default ProfileFormMenu;
