import React, { FC } from "react";
import MenuItem from "pages/instances/forms/FormMenuItem";

export const PROJECT_DETAILS = "Project details";
export const RESOURCE_LIMITS = "Resource limits";
export const CACHED_IMAGES = "Cached images";
export const RESTRICTIONS = "Restrictions";
export const NETWORKS = "Networks";

interface Props {
  isRestrictions: boolean;
  toggleRestrictionsOpen: () => void;
  active: string;
  setActive: (val: string) => void;
}

const ProjectFormMenu: FC<Props> = ({
  isRestrictions,
  toggleRestrictionsOpen,
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
          <div className="u-off-screen">
            <MenuItem label={RESOURCE_LIMITS} {...menuItemProps} />
            <MenuItem label={CACHED_IMAGES} {...menuItemProps} />
            <li className="p-side-navigation__item">
              <button
                type="button"
                className="p-side-navigation__accordion-button"
                aria-expanded={isRestrictions ? "true" : "false"}
                onClick={toggleRestrictionsOpen}
              >
                Restrictions
              </button>
              <ul
                className="p-side-navigation__list"
                aria-expanded={isRestrictions ? "true" : "false"}
              >
                <MenuItem label={NETWORKS} {...menuItemProps} />
              </ul>
            </li>
          </div>
        </ul>
      </nav>
    </div>
  );
};

export default ProjectFormMenu;
