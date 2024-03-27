import { FC, LinkHTMLAttributes, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import classnames from "classnames";

interface Props {
  to: string;
  title: string;
  children: ReactNode;
  className?: string;
}

const NavLink: FC<Props & LinkHTMLAttributes<HTMLElement>> = ({
  to,
  title,
  children,
  className,
  ...linkProps
}) => {
  const location = useLocation();

  // ignore last char to consider /instances and /instance as active
  const matchPart = to.substring(0, to.length - 1);
  const isActive = location.pathname.startsWith(matchPart);

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
