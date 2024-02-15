import { FC, ReactNode } from "react";
import classnames from "classnames";

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
    <main className={classnames("l-main", mainClassName)}>
      <div className="p-panel">
        {header}
        <div className={classnames("p-panel__content", contentClassName)}>
          {children}
        </div>
      </div>
    </main>
  );
};

export default CustomLayout;
