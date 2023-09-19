import React, { FC } from "react";
import { Button } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";

interface Props {
  project: string;
  pool: string;
}

const CreateVolumeBtn: FC<Props> = ({ project, pool }) => {
  const navigate = useNavigate();

  const handleAdd = () => {
    navigate(`/ui/project/${project}/storage/detail/${pool}/volumes/create
    `);
  };

  return (
    <Button hasIcon onClick={handleAdd} appearance="positive">
      Create volume
    </Button>
  );
};

export default CreateVolumeBtn;
