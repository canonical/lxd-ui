import type { PropsWithSpread } from "@canonical/react-components/dist/types";
import classNames from "classnames";
import type { HTMLProps, PropsWithChildren } from "react";

type Props = PropsWithSpread<
  {
    collapsed?: boolean;
    pinned?: boolean;
  } & PropsWithChildren,
  HTMLProps<HTMLDivElement>
>;

const AppNavigation = ({
  children,
  className,
  collapsed,
  pinned,
  ...props
}: Props) => {
  return (
    <header
      className={classNames("l-navigation", className, {
        "is-collapsed": collapsed,
        "is-pinned": pinned,
      })}
      {...props}
    >
      <div className="l-navigation__drawer">{children}</div>
    </header>
  );
};

export default AppNavigation;
