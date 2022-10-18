import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { LxdInstance } from "../../types/instance";

type Props = {
  instance: LxdInstance;
};

const OpenTerminalBtn: FC<Props> = ({ instance }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/instances/${instance.name}/terminal`);
  };

  return (
    <button
      onClick={handleOpen}
      className="is-dense"
      disabled={instance.status !== "Running"}
    >
      <i className="p-icon--open-terminal">Open terminal</i>
    </button>
  );
};

export default OpenTerminalBtn;
