import { FC, ReactNode } from "react";
import { AppMain, Panel } from "@canonical/react-components";

interface Props {
  title: string | ReactNode;
  controls?: ReactNode;
  children: ReactNode;
  mainClassName?: string;
  contentClassName?: string;
}

const BaseLayout: FC<Props> = ({
  title,
  controls,
  children,
  mainClassName,
  contentClassName,
}: Props) => {
  return (
    <AppMain className={mainClassName}>
      <Panel
        contentClassName={contentClassName}
        controls={controls}
        title={title}
      >
        {children}
      </Panel>
    </AppMain>
  );
};

export default BaseLayout;
