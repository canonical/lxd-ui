import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { LxdInstance } from "../../types/instance";
import { Button } from "@canonical/react-components";

type Props = {
  instance: LxdInstance;
};

const OpenVgaBtn: FC<Props> = ({ instance }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/instances/${instance.name}/vga`);
  };

  return (
    <Button
      dense
      onClick={handleOpen}
      disabled={
        instance.status !== "Running" || instance.type !== "virtual-machine"
      }
    >
      <i className="p-icon--canvas">Open VGA</i>
    </Button>
  );
};

export default OpenVgaBtn;
