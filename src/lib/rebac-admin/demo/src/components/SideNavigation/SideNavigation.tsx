import type { PropsWithSpread } from "@canonical/react-components/dist/types";
import classNames from "classnames";
import {
  type HTMLProps,
  type ComponentType,
  type ElementType,
  isValidElement,
} from "react";
import React from "react";

import type { SideNavigationItemProps } from "./SideNavigationItem";
import SideNavigationItem from "./SideNavigationItem";
import type { SideNavigationLinkDefaultElement } from "./SideNavigationLink";

export type Props<L = SideNavigationLinkDefaultElement> = PropsWithSpread<
  {
    dark?: boolean;
    hasIcons?: boolean;
    items: (SideNavigationItemProps<L> | React.JSX.Element)[];
    linkComponent?: ElementType | ComponentType<L>;
  },
  HTMLProps<HTMLDivElement>
>;

const generateItem = <L = SideNavigationLinkDefaultElement,>(
  item: Props<L>["items"][0],
  linkComponent: Props<L>["linkComponent"],
  index: number,
) => {
  return isValidElement(item) ? (
    <SideNavigationItem key={index}>{item}</SideNavigationItem>
  ) : "label" in item ? (
    <SideNavigationItem<L>
      {...item}
      key={index}
      component={item.component ?? linkComponent}
    />
  ) : null;
};

const SideNavigation = <L = SideNavigationLinkDefaultElement,>({
  children,
  className,
  dark,
  hasIcons,
  items,
  linkComponent,
  ...props
}: Props<L>) => {
  return (
    <div
      className={classNames(className, {
        "p-side-navigation--icons":
          hasIcons || items.some((item) => "icon" in item && !!item.icon),
        "is-dark": dark,
      })}
      {...props}
    >
      <nav aria-label="Main">
        <ul className="p-side-navigation__list">
          {items.map((item, i) => generateItem<L>(item, linkComponent, i))}
        </ul>
      </nav>
    </div>
  );
};

export default SideNavigation;
