import type { PropsWithSpread } from "@canonical/react-components/dist/types";
import classNames from "classnames";
import type { HTMLProps, PropsWithChildren } from "react";

type Props = PropsWithSpread<PropsWithChildren, HTMLProps<HTMLDivElement>>;

const AppNavigationBar = ({ children, className, ...props }: Props) => {
  return (
    <header className={classNames("l-navigation-bar", className)} {...props}>
      {children}
    </header>
  );
};

export default AppNavigationBar;
