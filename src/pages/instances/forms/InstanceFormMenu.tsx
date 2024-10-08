import { FC, useEffect, useState } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { Button, useNotify } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { useSupportedFeatures } from "context/useSupportedFeatures";

export const MAIN_CONFIGURATION = "Main configuration";
export const DISK_DEVICES = "Disk";
export const NETWORK_DEVICES = "Network";
export const GPU_DEVICES = "GPU";
export const PROXY_DEVICES = "Proxy";
export const OTHER_DEVICES = "Other";
export const RESOURCE_LIMITS = "Resource limits";
export const SECURITY_POLICIES = "Security policies";
export const MIGRATION = "Migration";
export const SNAPSHOTS = "Snapshots";
export const CLOUD_INIT = "Cloud init";
export const YAML_CONFIGURATION = "YAML configuration";

interface Props {
  isDisabled: boolean;
  active: string;
  setActive: (val: string) => void;
  hasDiskError: boolean;
  hasNetworkError: boolean;
}

const InstanceFormMenu: FC<Props> = ({
  isDisabled,
  active,
  setActive,
  hasDiskError,
  hasNetworkError,
}) => {
  const notify = useNotify();
  const [isDeviceExpanded, setDeviceExpanded] = useState(true);
  const { hasMetadataConfiguration } = useSupportedFeatures();

  const disableReason = isDisabled
    ? "Please select an image before adding custom configuration"
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
      <nav aria-label="Instance form navigation">
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
                hasError={hasDiskError}
                {...menuItemProps}
              />
              <MenuItem
                label={NETWORK_DEVICES}
                hasError={hasNetworkError}
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
          <MenuItem label={CLOUD_INIT} {...menuItemProps} />
        </ul>
      </nav>
    </div>
  );
};

export default InstanceFormMenu;
