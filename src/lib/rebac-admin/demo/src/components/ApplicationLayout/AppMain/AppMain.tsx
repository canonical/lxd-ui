import classNames from "classnames";
import type { HTMLProps, PropsWithChildren } from "react";

type Props = PropsWithChildren & HTMLProps<HTMLDivElement>;

const AppMain = ({ children, className, ...props }: Props) => {
  return (
    <main className={classNames("l-main", className)} {...props}>
      {children}
    </main>
  );
};

export default AppMain;
