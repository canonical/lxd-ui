import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { LxdInstance } from "types/instance";
import { Button, Tooltip } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
}

const OpenTerminalBtn: FC<Props> = ({ instance }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/ui/instances/${instance.name}/terminal`);
  };

  const isDisabled = instance.status !== "Running";

  return (
    <Tooltip
      message={isDisabled ? "Instance must be running" : undefined}
      position="btm-center"
    >
      <Button
        className="u-no-margin--bottom"
        dense
        hasIcon
        onClick={handleOpen}
        disabled={isDisabled}
      >
        <i className="p-icon--open-terminal" />
      </Button>
    </Tooltip>
  );
};

export default OpenTerminalBtn;
