import { Icon } from "@canonical/react-components";
import type { IconName } from "@canonical/ds-assets";
import type { FC, ReactNode } from "react";
import { matchPath, useLocation } from "react-router-dom";
import classnames from "classnames";
import DsIcon from "components/DsIcon";

export type AccordionNavMenu =
  | "permissions"
  | "storage"
  | "networking"
  | "clustering"
  | "images";

// "storage-pool" has no ds-assets equivalent yet.
type NavAccordionIcon = IconName | "storage-pool";

interface Props {
  baseUrls: string[];
  title: string;
  children: ReactNode;
  iconName: NavAccordionIcon;
  label: string;
  open: boolean;
  onOpen: () => void;
  disabled?: boolean;
}

const NavAccordion: FC<Props> = ({
  baseUrls,
  title,
  children,
  iconName,
  label,
  open,
  onOpen,
  disabled,
}) => {
  const location = useLocation();
  const isActive = baseUrls.some(
    (baseUrl) =>
      location.pathname.includes(baseUrl) ||
      Boolean(matchPath({ path: baseUrl, end: false }, location.pathname)),
  );

  return (
    <>
      <div
        title={title}
        aria-current={isActive && !open ? "page" : undefined}
        className={classnames("p-side-navigation__link accordion-nav-menu", {
          "is-disabled": disabled,
        })}
        onClick={disabled ? () => {} : onOpen}
        role="button"
      >
        {iconName === "storage-pool" ? (
          <Icon className="is-light p-side-navigation__icon" name={iconName} />
        ) : (
          <DsIcon
            className="is-light p-side-navigation__icon"
            icon={iconName}
          />
        )}{" "}
        {label}
        <DsIcon
          icon="chevron-up"
          className={classnames("accordion-nav-chevron", {
            open,
            closed: !open,
          })}
        />
      </div>
      <ul
        className="p-side-navigation__list"
        aria-expanded={open ? "true" : "false"}
      >
        {children}
      </ul>
    </>
  );
};

export default NavAccordion;
