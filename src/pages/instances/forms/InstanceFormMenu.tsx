import React, { FC, ReactNode, useEffect, useState } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { Button, useNotify } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import YamlConfirmation from "components/forms/YamlConfirmation";
import { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";

export const MAIN_CONFIGURATION = "Main configuration";
export const DISK_DEVICES = "Disk devices";
export const NETWORK_DEVICES = "Network devices";
export const RESOURCE_LIMITS = "Resource limits";
export const SECURITY_POLICIES = "Security policies";
export const SNAPSHOTS = "Snapshots";
export const CLOUD_INIT = "Cloud init";
export const YAML_CONFIGURATION = "YAML configuration";

interface Props {
  isConfigOpen: boolean;
  isConfigDisabled: boolean;
  toggleConfigOpen: () => void;
  active: string;
  setActive: (val: string) => void;
  hasDiskError: boolean;
  hasNetworkError: boolean;
  formik: InstanceAndProfileFormikProps;
}

const InstanceFormMenu: FC<Props> = ({
  isConfigOpen,
  isConfigDisabled,
  toggleConfigOpen,
  active,
  setActive,
  hasDiskError,
  hasNetworkError,
  formik,
}) => {
  const notify = useNotify();
  const [confirmModal, setConfirmModal] = useState<ReactNode | null>(null);
  const menuItemProps = {
    active,
    setActive: (val: string) => {
      if (Boolean(formik.values.yaml) && val !== YAML_CONFIGURATION) {
        const handleConfirm = () => {
          void formik.setFieldValue("yaml", undefined);
          setConfirmModal(null);
          setActive(val);
        };

        setConfirmModal(
          <YamlConfirmation
            onConfirm={handleConfirm}
            close={() => setConfirmModal(null)}
          />,
        );
      } else {
        setActive(val);
      }
    },
  };

  const resize = () => {
    updateMaxHeight("form-navigation", "p-bottom-controls");
  };
  useEffect(resize, [notify.notification?.message]);
  useEventListener("resize", resize);

  return (
    <div className="p-side-navigation--accordion form-navigation">
      {confirmModal}
      <nav aria-label="Instance form navigation">
        <ul className="p-side-navigation__list">
          <MenuItem label={MAIN_CONFIGURATION} {...menuItemProps} />
          <li className="p-side-navigation__item">
            <Button
              type="button"
              className="p-side-navigation__accordion-button"
              aria-expanded={isConfigOpen ? "true" : "false"}
              onClick={toggleConfigOpen}
              disabled={isConfigDisabled}
              title={
                isConfigDisabled
                  ? "Please select an image before adding custom configuration"
                  : ""
              }
            >
              Advanced
            </Button>
            <ul
              className="p-side-navigation__list"
              aria-expanded={isConfigOpen ? "true" : "false"}
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
              <MenuItem label={RESOURCE_LIMITS} {...menuItemProps} />
              <MenuItem label={SECURITY_POLICIES} {...menuItemProps} />
              <MenuItem label={SNAPSHOTS} {...menuItemProps} />
              <MenuItem label={CLOUD_INIT} {...menuItemProps} />
            </ul>
          </li>
          {isConfigDisabled ? (
            <li className="p-side-navigation__item">
              <Button
                className="p-side-navigation__link p-button--base"
                disabled={true}
                title="Please select an image before adding custom configuration"
              >
                {YAML_CONFIGURATION}
              </Button>
            </li>
          ) : (
            <MenuItem label={YAML_CONFIGURATION} {...menuItemProps} />
          )}
        </ul>
      </nav>
    </div>
  );
};

export default InstanceFormMenu;
