import React, { FC, ReactNode } from "react";
import usePanelParams from "../util/usePanelParams";

type Props = {
  title: ReactNode;
};

const PanelHeader: FC<Props> = ({ title }: Props) => {
  const panelParams = usePanelParams();

  return (
    <div className="p-panel__header">
      <div className="p-panel__title">{title}</div>
      <div className="p-panel__controls">
        <button
          onClick={panelParams.clear}
          className="p-button--base js-aside-close u-no-margin--bottom has-icon"
        >
          <i className="p-icon--close"></i>
        </button>
      </div>
    </div>
  );
};

export default PanelHeader;
