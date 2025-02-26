import { Icon } from "@canonical/react-components";
import type { FC, ReactNode } from "react";
import { useLocation } from "react-router-dom";

export type AccordionNavMenu = "permissions" | "storage";

interface Props {
  baseUrl: string;
  title: string;
  children: ReactNode;
  iconName: string;
  label: string;
  open: boolean;
  onOpen: () => void;
}

const NavAccordion: FC<Props> = ({
  baseUrl,
  title,
  children,
  iconName,
  label,
  open,
  onOpen,
}) => {
  const location = useLocation();
  const isActive = location.pathname.includes(baseUrl);

  return (
    <>
      <div
        title={title}
        aria-current={isActive && !open ? "page" : undefined}
        className="p-side-navigation__link accordion-nav-menu"
        onClick={onOpen}
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
