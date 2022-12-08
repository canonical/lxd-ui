import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { LxdInstance } from "../../types/instance";
import { Button, Tooltip } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
}

const OpenVgaBtn: FC<Props> = ({ instance }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/instances/${instance.name}/vga`);
  };

  const getTooltipMessage = () => {
    if (instance.type !== "virtual-machine") {
      return "Instance type must be virtual-machine";
    }
    if (instance.status !== "Running") {
      return "Instance must be running";
    }
    return undefined;
  };

  return (
    <Tooltip message={getTooltipMessage()} position="left">
      <Button
        appearance="base"
        className="p-contextual-menu__link"
        dense
        hasIcon
        onClick={handleOpen}
        disabled={
          instance.status !== "Running" || instance.type !== "virtual-machine"
        }
      >
        <i className="p-icon--canvas" />
        <span>Open VGA session</span>
      </Button>
    </Tooltip>
  );
};

export default OpenVgaBtn;
