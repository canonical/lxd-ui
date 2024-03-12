import { Icon } from "@canonical/react-components";
import { FC, LinkHTMLAttributes, ReactNode, useState } from "react";
import { useLocation } from "react-router-dom";
import NavLink from "./NavLink";

interface Props {
  to: string;
  baseUrl: string;
  title: string;
  children: ReactNode;
  navItems: ({
    to: string;
    title: string;
    label: string;
  } & LinkHTMLAttributes<HTMLElement>)[];
}

const AccordianNavMenu: FC<Props> = ({
  baseUrl,
  title,
  children,
  navItems,
}) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = location.pathname.includes(baseUrl);

  const toggleLink = () => {
    setIsOpen((prev) => {
      return !prev;
    });
  };

  const secondaryNavLinks = navItems.map((item) => {
    return (
      <li className="p-side-navigation__item" key={item.to}>
        <NavLink
          to={item.to}
          title={item.title}
          onClick={item.onClick}
          className="accordian-nav-secondary"
        >
          {item.label}
        </NavLink>
      </li>
    );
  });

  return (
    <>
      <div
        title={title}
        aria-current={isActive ? "page" : undefined}
        className="p-side-navigation__link accordian-nav-menu"
        onClick={toggleLink}
        role="button"
      >
        {children}
        <Icon name="chevron-up" className={isOpen ? "open" : "closed"} />
      </div>
      <ul
        className="p-side-navigation__list"
        aria-expanded={isOpen ? "true" : "false"}
      >
        {secondaryNavLinks}
      </ul>
    </>
  );
};

export default AccordianNavMenu;
