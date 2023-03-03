import React, { FC } from "react";
import MenuItem from "pages/instances/forms/FormMenuItem";

export const INSTANCE_DETAILS = "Instance details";
export const DEVICES = "Devices";
export const RESOURCE_LIMITS = "Resource limits";
export const SECURITY_POLICIES = "Security policies";
export const SNAPSHOTS = "Snapshots";
export const CLOUD_INIT = "Cloud init";
export const YAML_CONFIGURATION = "YAML configuration";

interface Props {
  isConfigOpen: boolean;
  toggleConfigOpen: () => void;
  active: string;
  setActive: (val: string) => void;
}

const InstanceFormMenu: FC<Props> = ({
  isConfigOpen,
  toggleConfigOpen,
  active,
  setActive,
}) => {
  const menuItemProps = {
    active,
    setActive,
  };

  return (
    <div className="p-side-navigation--accordion form-navigation">
      <nav aria-label="Instance creation">
        <ul className="p-side-navigation__list">
          <MenuItem label={INSTANCE_DETAILS} {...menuItemProps} />
          <li className="p-side-navigation__item">
            <button
              type="button"
              className="p-side-navigation__accordion-button"
              aria-expanded={isConfigOpen ? "true" : "false"}
              onClick={toggleConfigOpen}
            >
              Configuration
            </button>
            <ul
              className="p-side-navigation__list"
              aria-expanded={isConfigOpen ? "true" : "false"}
            >
              <MenuItem label={DEVICES} {...menuItemProps} />
              <MenuItem label={RESOURCE_LIMITS} {...menuItemProps} />
              <MenuItem label={SECURITY_POLICIES} {...menuItemProps} />
              <MenuItem label={SNAPSHOTS} {...menuItemProps} />
              <MenuItem label={CLOUD_INIT} {...menuItemProps} />
            </ul>
          </li>
          <MenuItem label={YAML_CONFIGURATION} {...menuItemProps} />
        </ul>
      </nav>
    </div>
  );
};

export default InstanceFormMenu;
