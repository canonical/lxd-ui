import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { LxdInstance } from "../../types/instance";
import { Button } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
}

const OpenTerminalBtn: FC<Props> = ({ instance }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/instances/${instance.name}/terminal`);
  };

  return (
    <Button dense onClick={handleOpen} disabled={instance.status !== "Running"}>
      <i className="p-icon--open-terminal">Open terminal</i>
    </Button>
  );
};

export default OpenTerminalBtn;
