import { Icon } from "@canonical/react-components";
import type { FC, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import classnames from "classnames";

export type AccordionNavMenu =
  | "permissions"
  | "storage"
  | "networking"
  | "clustering";

interface Props {
  baseUrls: string[];
  title: string;
  children: ReactNode;
  iconName: string;
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
  const isActive = baseUrls.some((baseUrl) =>
    location.pathname.includes(baseUrl),
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
        <Icon className="is-light p-side-navigation__icon" name={iconName} />{" "}
        {label}
        <Icon name="chevron-up" className={open ? "open" : "closed"} />
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
