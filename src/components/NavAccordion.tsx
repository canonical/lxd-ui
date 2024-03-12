import { Icon } from "@canonical/react-components";
import { FC, ReactNode, useLayoutEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface Props {
  baseUrl: string;
  title: string;
  children: ReactNode;
  iconName: string;
  label: string;
  onToggle?: () => void;
}

const NavAccordion: FC<Props> = ({
  baseUrl,
  title,
  children,
  iconName,
  label,
  onToggle,
}) => {
  const location = useLocation();
  const isActive = location.pathname.includes(baseUrl);
  const [isOpen, setIsOpen] = useState(isActive);

  const toggleLink = () => {
    setIsOpen((prev) => {
      return !prev;
    });
  };

  useLayoutEffect(() => {
    if (onToggle) {
      onToggle();
    }
  }, [isOpen]);

  return (
    <>
      <div
        title={title}
        aria-current={isActive && !isOpen ? "page" : undefined}
        className="p-side-navigation__link accordion-nav-menu"
        onClick={toggleLink}
        role="button"
      >
        <Icon className="is-light p-side-navigation__icon" name={iconName} />{" "}
        {label}
        <Icon name="chevron-up" className={isOpen ? "open" : "closed"} />
      </div>
      <ul
        className="p-side-navigation__list"
        aria-expanded={isOpen ? "true" : "false"}
      >
        {children}
      </ul>
    </>
  );
};

export default NavAccordion;
