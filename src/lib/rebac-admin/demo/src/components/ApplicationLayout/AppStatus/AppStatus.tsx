import classNames from "classnames";
import type { HTMLProps, PropsWithChildren } from "react";

import Panel from "components/Panel";

type Props = PropsWithChildren & HTMLProps<HTMLDivElement>;

const AppStatus = ({ children, className, ...props }: Props) => {
  return (
    <aside className={classNames("l-status", className)} {...props}>
      <Panel wrapContent={false}>{children}</Panel>
    </aside>
  );
};

export default AppStatus;
