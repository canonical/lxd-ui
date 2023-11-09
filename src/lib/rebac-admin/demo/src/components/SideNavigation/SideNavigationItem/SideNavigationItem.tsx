import type { PropsWithChildren } from "react";

import SideNavigationLink from "../SideNavigationLink";
import type { SideNavigationLinkProps } from "../SideNavigationLink";
import type { SideNavigationLinkDefaultElement } from "../SideNavigationLink";

export type Props<L = SideNavigationLinkDefaultElement> =
  | PropsWithChildren
  | SideNavigationLinkProps<L>;

const SideNavigationItem = <L = SideNavigationLinkDefaultElement,>(
  props: Props<L>,
) => {
  return (
    <li className="p-side-navigation__item">
      {"label" in props ? <SideNavigationLink<L> {...props} /> : props.children}
    </li>
  );
};

export default SideNavigationItem;
