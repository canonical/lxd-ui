import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { LxdInstance } from "types/instance";
import { Button } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
  className?: string;
}

const OpenTerminalBtn: FC<Props> = ({
  instance,
  className = "u-no-margin--bottom",
}) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(
      `/ui/${instance.project}/instances/detail/${instance.name}/terminal`
    );
  };

  const isDisabled = instance.status !== "Running";

  return (
    <Button
      className={className}
      dense
      hasIcon
      onClick={handleOpen}
      disabled={isDisabled}
      title={isDisabled ? "Instance must be running" : "Terminal"}
    >
      <i className="p-icon--code">Open Terminal</i>
    </Button>
  );
};

export default OpenTerminalBtn;
