import React, { FC, ReactNode } from "react";
import { useQueryParams } from "use-query-params";
import { getPanelQsRemovalObj, panelQueryMap } from "../panels/panels";

type Props = {
  title: ReactNode;
};

const PanelHeader: FC<Props> = ({ title }: Props) => {
  const [, setPanelQs] = useQueryParams(panelQueryMap);

  return (
    <div className="p-panel__header">
      <div className="p-panel__title">{title}</div>
      <div className="p-panel__controls">
        <button
          onClick={() => setPanelQs(getPanelQsRemovalObj())}
          className="p-button--base js-aside-close u-no-margin--bottom has-icon"
        >
          <i className="p-icon--close"></i>
        </button>
      </div>
    </div>
  );
};

export default PanelHeader;
