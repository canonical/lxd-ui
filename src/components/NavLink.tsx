import { FC, LinkHTMLAttributes, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import classnames from "classnames";

interface Props {
  to: string;
  title: string;
  children: ReactNode;
  className?: string;
  activeUrlMatches?: string[];
  ignoreUrlMatches?: string[];
}

const NavLink: FC<Props & LinkHTMLAttributes<HTMLElement>> = ({
  to,
  title,
  children,
  className,
  activeUrlMatches = [],
  ignoreUrlMatches = [],
  ...linkProps
}) => {
  const location = useLocation();

  // ignore last char to consider /instances and /instance as active
  const matchPart = to.substring(0, to.length - 1);
  let isActive = location.pathname.startsWith(matchPart);

  // this caters for more custom url matches for link to be active e.g. /identities & /identity/oidc etc
  for (const match of activeUrlMatches) {
    if (location.pathname.includes(match)) {
      isActive = true;
    }
  }

  for (const match of ignoreUrlMatches) {
    if (location.pathname.includes(match)) {
      isActive = false;
    }
  }

  return (
    <Link
      title={title}
      to={to}
      aria-current={isActive ? "page" : undefined}
      className={classnames("p-side-navigation__link", className)}
      {...linkProps}
    >
      {children}
    </Link>
  );
};

export default NavLink;
