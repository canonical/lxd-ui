import React, { FC } from "react";
import { Button } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";

interface Props {
  project: string;
  className?: string;
}

const CreateVolumeBtn: FC<Props> = ({ project, className }) => {
  const navigate = useNavigate();

  const handleAdd = () => {
    navigate(`/ui/project/${project}/storage/volumes/create
    `);
  };

  return (
    <Button
      appearance="positive"
      hasIcon
      onClick={handleAdd}
      className={className}
    >
      Create volume
    </Button>
  );
};

export default CreateVolumeBtn;
