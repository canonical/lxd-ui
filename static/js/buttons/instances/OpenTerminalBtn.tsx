import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { LxdInstance } from "../../types/instance";
import { Button, Tooltip } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
}

const OpenTerminalBtn: FC<Props> = ({ instance }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/instances/${instance.name}/terminal`);
  };

  const isDisabled = instance.status !== "Running";

  return (
    <Tooltip
      message={isDisabled ? "Instance must be running" : undefined}
      position="left"
    >
      <Button
        appearance="base"
        className="p-contextual-menu__link"
        dense
        hasIcon
        onClick={handleOpen}
        disabled={isDisabled}
      >
        <i className="p-icon--open-terminal" />
        <span>Open terminal</span>
      </Button>
    </Tooltip>
  );
};

export default OpenTerminalBtn;
