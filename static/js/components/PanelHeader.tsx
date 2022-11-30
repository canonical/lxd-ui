import React, { FC, ReactNode } from "react";
import usePanelParams from "../util/usePanelParams";
import { Button } from "@canonical/react-components";

type Props = {
  title: ReactNode;
};

const PanelHeader: FC<Props> = ({ title }: Props) => {
  const panelParams = usePanelParams();

  return (
    <div className="p-panel__header">
      <div className="p-panel__title">{title}</div>
      <div className="p-panel__controls">
        <Button appearance="base" hasIcon onClick={panelParams.clear}>
          <i className="p-icon--close"></i>
        </Button>
      </div>
    </div>
  );
};

export default PanelHeader;
