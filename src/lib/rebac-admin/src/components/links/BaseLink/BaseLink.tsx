import type { NavLinkProps } from "react-router-dom";
import { NavLink } from "react-router-dom";

export type BaseLinkProps = Omit<NavLinkProps, "to"> & {
  baseURL: string;
  to: string;
};

const BaseLink = ({ baseURL, to, ...props }: BaseLinkProps) => (
  <NavLink
    to={[baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL, to].join("")}
    {...props}
  />
);

export default BaseLink;
