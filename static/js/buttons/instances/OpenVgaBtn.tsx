import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { LxdInstance } from "../../types/instance";

type Props = {
  instance: LxdInstance;
};

const OpenVgaBtn: FC<Props> = ({ instance }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/instances/${instance.name}/vga`);
  };

  return (
    <button
      onClick={handleOpen}
      className="is-dense"
      disabled={
        instance.status !== "Running" || instance.type !== "virtual-machine"
      }
    >
      <i className="p-icon--canvas">Open VGA</i>
    </button>
  );
};

export default OpenVgaBtn;
