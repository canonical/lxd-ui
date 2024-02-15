import { FC, ReactNode } from "react";
import classnames from "classnames";

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
    <main className={classnames("l-main", mainClassName)}>
      <div className="p-panel">
        <div className="p-panel__header">
          <h1 className="p-panel__title">{title}</h1>
          {controls && <div className="p-panel__controls">{controls}</div>}
        </div>
        <div className={classnames("p-panel__content", contentClassName)}>
          {children}
        </div>
      </div>
    </main>
  );
};

export default BaseLayout;
