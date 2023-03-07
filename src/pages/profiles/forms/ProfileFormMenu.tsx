import React, { FC } from "react";
import MenuItem from "pages/instances/forms/FormMenuItem";

export const PROFILE_DETAILS = "Profile details";
export const STORAGE = "Storage";
export const NETWORKS = "Networks";
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

const ProfileFormMenu: FC<Props> = ({
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
      <nav aria-label="Profile form navigation">
        <ul className="p-side-navigation__list">
          <MenuItem label={PROFILE_DETAILS} {...menuItemProps} />
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
              <MenuItem label={STORAGE} {...menuItemProps} />
              <MenuItem label={NETWORKS} {...menuItemProps} />
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

export default ProfileFormMenu;
