import React, { FC, ReactNode } from "react";
import { useQueryParams, StringParam } from "use-query-params";

type Props = {
  title: ReactNode;
};

type QueryString = {
  [key: string]: string | undefined;
};

const PanelHeader: FC<Props> = ({ title }: Props) => {
  const [panelQs, setPanelQs] = useQueryParams({
    panel: StringParam,
    model: StringParam,
  });

  // Remove all query strings when close button is clicked
  const removalObj: QueryString = {};
  Object.keys(panelQs).forEach((queryString: string) => {
    removalObj[queryString] = undefined;
  });

  return (
    <div className="p-panel__header">
      <div className="p-panel__title">{title}</div>
      <div className="p-panel__controls">
        <button
          onClick={() => setPanelQs(removalObj)}
          className="p-button--base js-aside-close u-no-margin--bottom has-icon"
        >
          <i className="p-icon--close"></i>
        </button>
      </div>
    </div>
  );
};

export default PanelHeader;
