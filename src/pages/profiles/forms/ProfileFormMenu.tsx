import React, { FC, useEffect } from "react";
import MenuItem from "pages/instances/forms/FormMenuItem";
import { Button, useNotify } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";

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
  const notify = useNotify();
  const menuItemProps = {
    active,
    setActive,
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
          <MenuItem label={PROFILE_DETAILS} {...menuItemProps} />
          <li className="p-side-navigation__item">
            <Button
              type="button"
              className="p-side-navigation__accordion-button"
              aria-expanded={isConfigOpen ? "true" : "false"}
              onClick={toggleConfigOpen}
            >
              Configuration options
            </Button>
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
