import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { LxdInstance } from "types/instance";
import { Button } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
}

const OpenSnapshotsBtn: FC<Props> = ({ instance }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/instances/${instance.name}/snapshots`);
  };

  return (
    <Button
      appearance="base"
      className="p-contextual-menu__link"
      dense
      hasIcon
      onClick={handleOpen}
    >
      <i className="p-icon--settings" />
      <span>Manage snapshots</span>
    </Button>
  );
};

export default OpenSnapshotsBtn;
