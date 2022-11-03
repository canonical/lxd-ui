import React, { FC, ReactNode } from "react";

type Props = {
  title: string;
  controls?: ReactNode | null;
  children: ReactNode;
};

const BaseLayout: FC<Props> = ({ title, controls = null, children }: Props) => {
  return (
    <main className="l-main">
      <div className="p-panel">
        <div className="p-panel__header">
          <h4 className="p-panel__title">{title}</h4>
          <div className="p-panel__controls">{controls}</div>
        </div>
        <div className="p-panel__content">{children}</div>
      </div>
    </main>
  );
};

export default BaseLayout;
