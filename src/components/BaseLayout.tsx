import React, { FC, ReactNode } from "react";
import classnames from "classnames";

interface Props {
  title?: string | ReactNode;
  controls?: ReactNode;
  customHeader?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}

const BaseLayout: FC<Props> = ({
  title,
  controls,
  customHeader,
  children,
  contentClassName,
}: Props) => {
  const hasHeader = Boolean(title) || Boolean(controls);
  const hasCustomHeader = Boolean(customHeader);

  return (
    <main className="l-main">
      <div className="p-panel">
        {hasHeader ? (
          <div className="p-panel__header">
            {title && <h1 className="p-panel__title">{title}</h1>}
            {controls && <div className="p-panel__controls">{controls}</div>}
          </div>
        ) : hasCustomHeader ? (
          customHeader
        ) : null}
        <div className={classnames("p-panel__content", contentClassName)}>
          {children}
        </div>
      </div>
    </main>
  );
};

export default BaseLayout;
