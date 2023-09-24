import React, { FC, ReactNode } from "react";
import classnames from "classnames";

interface Props {
  title?: string | ReactNode;
  controls?: ReactNode | null;
  children: ReactNode;
  contentClassName?: string;
}

const BaseLayout: FC<Props> = ({
  title,
  controls = null,
  children,
  contentClassName,
}: Props) => {
  const hasHeader = Boolean(title) || Boolean(controls);

  return (
    <main className="l-main">
      <div className="p-panel">
        {hasHeader && (
          <div className={classnames("p-panel__header", contentClassName)}>
            {title && <h1 className="p-panel__title">{title}</h1>}
            {controls && <div className="p-panel__controls">{controls}</div>}
          </div>
        )}
        <div className="p-panel__content">{children}</div>
      </div>
    </main>
  );
};

export default BaseLayout;
