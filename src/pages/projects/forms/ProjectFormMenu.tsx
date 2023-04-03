import React, { FC } from "react";
import MenuItem from "pages/instances/forms/FormMenuItem";
import { Button } from "@canonical/react-components";

export const PROJECT_DETAILS = "Project details";
export const RESOURCE_LIMITS = "Resource limits";
export const CLUSTERS = "Clusters";
export const INSTANCES = "Instances";
export const DEVICE_USAGE = "Device usage";
export const NETWORKS = "Networks";

interface Props {
  isRestrictionsOpen: boolean;
  toggleRestrictionsOpen: () => void;
  isRestrictionsDisabled: boolean;
  active: string;
  setActive: (val: string) => void;
}

const ProjectFormMenu: FC<Props> = ({
  isRestrictionsOpen,
  toggleRestrictionsOpen,
  isRestrictionsDisabled,
  active,
  setActive,
}) => {
  const menuItemProps = {
    active,
    setActive,
  };

  return (
    <div className="p-side-navigation--accordion form-navigation">
      <nav aria-label="Project form navigation">
        <ul className="p-side-navigation__list">
          <MenuItem label={PROJECT_DETAILS} {...menuItemProps} />
          <MenuItem label={RESOURCE_LIMITS} {...menuItemProps} />
          <li className="p-side-navigation__item">
            <Button
              type="button"
              className="p-side-navigation__accordion-button"
              aria-expanded={isRestrictionsOpen ? "true" : "false"}
              onClick={toggleRestrictionsOpen}
              disabled={isRestrictionsDisabled}
            >
              Restrictions
            </Button>
            <ul
              className="p-side-navigation__list"
              aria-expanded={isRestrictionsOpen ? "true" : "false"}
            >
              <MenuItem label={CLUSTERS} {...menuItemProps} />
              <MenuItem label={INSTANCES} {...menuItemProps} />
              <MenuItem label={DEVICE_USAGE} {...menuItemProps} />
              <MenuItem label={NETWORKS} {...menuItemProps} />
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ProjectFormMenu;
