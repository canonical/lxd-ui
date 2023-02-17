import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { LxdInstance } from "types/instance";
import { Button, Tooltip } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
  className?: string;
}

const OpenVgaBtn: FC<Props> = ({
  instance,
  className = "u-no-margin--bottom",
}) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/ui/${instance.project}/instances/${instance.name}/vga`);
  };

  const getTooltipMessage = () => {
    if (instance.type !== "virtual-machine") {
      return "Instance type must be virtual-machine";
    }
    if (instance.status !== "Running") {
      return "Instance must be running";
    }
    return "VGA Console";
  };

  return (
    <Tooltip message={getTooltipMessage()} position="top-right">
      <Button
        className={className}
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
