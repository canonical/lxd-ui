import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { LxdInstance } from "types/instance";
import { Button, Tooltip } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
}

const OpenVgaBtn: FC<Props> = ({ instance }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/ui/instances/${instance.name}/vga`);
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
    <Tooltip message={getTooltipMessage()} position="btm-center">
      <Button
        className="u-no-margin--bottom"
        dense
        hasIcon
        onClick={handleOpen}
        disabled={
          instance.status !== "Running" || instance.type !== "virtual-machine"
        }
      >
        <i className="p-icon--canvas" />
      </Button>
    </Tooltip>
  );
};

export default OpenVgaBtn;
