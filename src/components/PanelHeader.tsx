import React, { FC, MouseEvent, ReactNode } from "react";
import usePanelParams from "util/usePanelParams";
import { Button } from "@canonical/react-components";

interface Props {
  title: ReactNode;
  onClose?: (e: MouseEvent<HTMLElement>) => void;
}

const PanelHeader: FC<Props> = ({ title, onClose }: Props) => {
  const panelParams = usePanelParams();

  return (
    <div className="p-panel__header">
      <div className="p-panel__title">{title}</div>
      <div className="p-panel__controls">
        <Button
          appearance="base"
          hasIcon
          onClick={onClose ?? panelParams.clear}
          aria-label="close panel"
        >
          <i className="p-icon--close"></i>
        </Button>
      </div>
    </div>
  );
};

export default PanelHeader;
