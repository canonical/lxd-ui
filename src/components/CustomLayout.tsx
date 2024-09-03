import { FC, ReactNode } from "react";
import { AppMain, Panel } from "@canonical/react-components";

interface Props {
  header?: ReactNode;
  children: ReactNode;
  mainClassName?: string;
  contentClassName?: string;
}

const CustomLayout: FC<Props> = ({
  header,
  children,
  mainClassName,
  contentClassName,
}: Props) => {
  return (
    <AppMain className={mainClassName}>
      <Panel contentClassName={contentClassName} header={header}>
        {children}
      </Panel>
    </AppMain>
  );
};

export default CustomLayout;
