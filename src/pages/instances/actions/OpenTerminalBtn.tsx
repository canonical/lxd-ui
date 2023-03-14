import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { LxdInstance } from "types/instance";
import { Button } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
}

const OpenTerminalBtn: FC<Props> = ({ instance }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(
      `/ui/${instance.project}/instances/detail/${instance.name}/terminal`
    );
  };

  const isDisabled = instance.status !== "Running";

  return (
    <Button
      appearance="base"
      dense
      hasIcon
      onClick={handleOpen}
      disabled={isDisabled}
      title="Terminal"
    >
      <i className="p-icon--code">Open Terminal</i>
    </Button>
  );
};

export default OpenTerminalBtn;
