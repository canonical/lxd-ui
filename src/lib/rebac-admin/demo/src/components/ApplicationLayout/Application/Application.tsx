import type { PropsWithSpread } from "@canonical/react-components/dist/types";
import classNames from "classnames";
import type { HTMLProps, PropsWithChildren } from "react";

type Props = PropsWithSpread<PropsWithChildren, HTMLProps<HTMLDivElement>>;

const Application = ({ children, className, ...props }: Props) => {
  return (
    <div
      className={classNames("l-application", className)}
      role="presentation"
      {...props}
    >
      {children}
    </div>
  );
};

export default Application;
