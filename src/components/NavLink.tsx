import { FC, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

interface Props {
  to: string;
  title: string;
  children: ReactNode;
}

const NavLink: FC<Props> = ({ to, title, children }) => {
  const location = useLocation();

  // ignore last char to consider /instances and /instance as active
  const matchPart = to.substring(0, to.length - 1);
  const isActive = location.pathname.startsWith(matchPart);

  return (
    <Link
      title={title}
      to={to}
      aria-current={isActive ? "page" : undefined}
      className="p-side-navigation__link"
    >
      {children}
    </Link>
  );
};

export default NavLink;
