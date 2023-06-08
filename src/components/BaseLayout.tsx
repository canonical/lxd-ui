import React, { FC, ReactNode } from "react";

interface Props {
  title?: string | ReactNode;
  controls?: ReactNode | null;
  children: ReactNode;
}

const BaseLayout: FC<Props> = ({ title, controls = null, children }: Props) => {
  const hasHeader = Boolean(title) || Boolean(controls);

  return (
    <main className="l-main">
      <div className="p-panel">
        {hasHeader && (
          <div className="p-panel__header">
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
