import { useEffect, useState, type FC } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { Button, Icon, useListener, useNotify } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import { hasPrefixValue } from "util/formFields";
import {
  isDiskDevice,
  isGPUDevice,
  isNicDevice,
  isOtherDevice,
  isProxyDevice,
} from "util/devices";
import { slugify } from "util/slugify";
import classnames from "classnames";

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
export const BOOT = "Boot";
export const CLOUD_INIT = "Cloud init";
export const YAML_CONFIGURATION = "YAML configuration";

interface Props {
  isDisabled: boolean;
  active: string;
  setActive: (val: string) => void;
  hasDiskError: boolean;
  hasNetworkError: boolean;
  formik: InstanceAndProfileFormikProps;
}

const InstanceFormMenu: FC<Props> = ({
  isDisabled,
  active,
  setActive,
  hasDiskError,
  hasNetworkError,
  formik,
}) => {
  const notify = useNotify();
  const [isDeviceExpanded, setDeviceExpanded] = useState(true);
  const { hasMetadataConfiguration } = useSupportedFeatures();

  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

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
  useListener(window, resize, "resize", true);

  const sections = [
    { label: MAIN_CONFIGURATION, hasError: false },
    { label: DISK_DEVICES, hasError: hasDiskError },
    { label: NETWORK_DEVICES, hasError: hasNetworkError },
    { label: GPU_DEVICES, hasError: false },
    { label: PROXY_DEVICES, hasError: false },
    ...(hasMetadataConfiguration ? [{ label: OTHER_DEVICES, hasError: false }] : []),
    { label: RESOURCE_LIMITS, hasError: false },
    { label: SECURITY_POLICIES, hasError: false },
    { label: SNAPSHOTS, hasError: false },
    { label: MIGRATION, hasError: false },
    { label: BOOT, hasError: false },
    { label: CLOUD_INIT, hasError: false },
  ];

  const activeSection = sections.find(
    (s) => slugify(s.label) === slugify(active)
  );
  const activeLabel = activeSection ? activeSection.label : active;

  const renderDropdownMenu = () => {
    const onItemClick = (val: string) => {
      setActive(val);
      setIsOverlayOpen(false);
    };

    return (
      <>
        {isOverlayOpen && (
          <div
            className="mobile-dropdown-backdrop"
            onClick={() => setIsOverlayOpen(false)}
          />
        )}
        <div className="mobile-menu-trigger-container">
          <button
            type="button"
            className="mobile-menu-trigger-btn"
            onClick={() => setIsOverlayOpen(!isOverlayOpen)}
            aria-expanded={isOverlayOpen}
          >
            <span>{activeLabel}</span>
            <Icon name={isOverlayOpen ? "chevron-up" : "chevron-down"} />
          </button>

          {isOverlayOpen && (
            <div className="mobile-dropdown-menu">
              <nav aria-label="Instance form mobile navigation">
                <ul className="p-side-navigation__list">
                  <MenuItem
                    label={MAIN_CONFIGURATION}
                    {...menuItemProps}
                    isBold
                    setActive={onItemClick}
                  />
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
                      {formik.values.devices.length > 0 ? (
                        <strong>Devices</strong>
                      ) : (
                        "Devices"
                      )}
                    </Button>
                    <ul
                      className="p-side-navigation__list"
                      aria-expanded={isDeviceExpanded ? "true" : "false"}
                      >
                        <MenuItem
                          label={DISK_DEVICES}
                          hasError={hasDiskError}
                          {...menuItemProps}
                          isBold={formik.values.devices.some(isDiskDevice)}
                          setActive={onItemClick}
                        />
                        <MenuItem
                          label={NETWORK_DEVICES}
                          hasError={hasNetworkError}
                          {...menuItemProps}
                          isBold={formik.values.devices.some(isNicDevice)}
                          setActive={onItemClick}
                        />
                        <MenuItem
                          label={GPU_DEVICES}
                          {...menuItemProps}
                          isBold={formik.values.devices.some(isGPUDevice)}
                          setActive={onItemClick}
                        />
                        <MenuItem
                          label={PROXY_DEVICES}
                          {...menuItemProps}
                          isBold={formik.values.devices.some(isProxyDevice)}
                          setActive={onItemClick}
                        />
                        {hasMetadataConfiguration && (
                          <MenuItem
                            label={OTHER_DEVICES}
                            {...menuItemProps}
                            isBold={formik.values.devices.some(isOtherDevice)}
                            setActive={onItemClick}
                          />
                        )}
                      </ul>
                    </li>
                    <MenuItem
                      label={RESOURCE_LIMITS}
                      {...menuItemProps}
                      isBold={hasPrefixValue(formik, "limits_")}
                      setActive={onItemClick}
                    />
                    <MenuItem
                      label={SECURITY_POLICIES}
                      {...menuItemProps}
                      isBold={hasPrefixValue(formik, "security_")}
                      setActive={onItemClick}
                    />
                    <MenuItem
                      label={SNAPSHOTS}
                      {...menuItemProps}
                      isBold={hasPrefixValue(formik, "snapshots_")}
                      setActive={onItemClick}
                    />
                    <MenuItem
                      label={MIGRATION}
                      {...menuItemProps}
                      isBold={
                        hasPrefixValue(formik, "migration_") ||
                        hasPrefixValue(formik, "cluster_")
                      }
                      setActive={onItemClick}
                    />
                    <MenuItem
                      label={BOOT}
                      {...menuItemProps}
                      isBold={hasPrefixValue(formik, "boot_")}
                      setActive={onItemClick}
                    />
                    <MenuItem
                      label={CLOUD_INIT}
                      {...menuItemProps}
                      isBold={hasPrefixValue(
                        formik,
                        "cloud_init_",
                        "cloud_init_ssh_keys",
                      )}
                      setActive={onItemClick}
                    />
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </>
      );
  };

  return (
    <>
      {renderDropdownMenu()}

      <div className="p-side-navigation--accordion form-navigation">
        <nav aria-label="Instance form navigation">
          <ul className="p-side-navigation__list">
            <MenuItem label={MAIN_CONFIGURATION} {...menuItemProps} isBold />
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
                {formik.values.devices.length > 0 ? (
                  <strong>Devices</strong>
                ) : (
                  "Devices"
                )}
              </Button>
              <ul
                className="p-side-navigation__list"
                aria-expanded={isDeviceExpanded ? "true" : "false"}
              >
                <MenuItem
                  label={DISK_DEVICES}
                  hasError={hasDiskError}
                  {...menuItemProps}
                  isBold={formik.values.devices.some(isDiskDevice)}
                />
                <MenuItem
                  label={NETWORK_DEVICES}
                  hasError={hasNetworkError}
                  {...menuItemProps}
                  isBold={formik.values.devices.some(isNicDevice)}
                />
                <MenuItem
                  label={GPU_DEVICES}
                  {...menuItemProps}
                  isBold={formik.values.devices.some(isGPUDevice)}
                />
                <MenuItem
                  label={PROXY_DEVICES}
                  {...menuItemProps}
                  isBold={formik.values.devices.some(isProxyDevice)}
                />
                {hasMetadataConfiguration && (
                  <MenuItem
                    label={OTHER_DEVICES}
                    {...menuItemProps}
                    isBold={formik.values.devices.some(isOtherDevice)}
                  />
                )}
              </ul>
            </li>
            <MenuItem
              label={RESOURCE_LIMITS}
              {...menuItemProps}
              isBold={hasPrefixValue(formik, "limits_")}
            />
            <MenuItem
              label={SECURITY_POLICIES}
              {...menuItemProps}
              isBold={hasPrefixValue(formik, "security_")}
            />
            <MenuItem
              label={SNAPSHOTS}
              {...menuItemProps}
              isBold={hasPrefixValue(formik, "snapshots_")}
            />
            <MenuItem
              label={MIGRATION}
              {...menuItemProps}
              isBold={
                hasPrefixValue(formik, "migration_") ||
                hasPrefixValue(formik, "cluster_")
              }
            />
            <MenuItem
              label={BOOT}
              {...menuItemProps}
              isBold={hasPrefixValue(formik, "boot_")}
            />
            <MenuItem
              label={CLOUD_INIT}
              {...menuItemProps}
              isBold={hasPrefixValue(
                formik,
                "cloud_init_",
                "cloud_init_ssh_keys",
              )}
            />
          </ul>
        </nav>
      </div>
    </>
  );
};

export default InstanceFormMenu;

