import React, { FC } from "react";
import { Button } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";

interface Props {
  project: string;
  className?: string;
}

const AddStorageBtn: FC<Props> = ({ project, className }) => {
  const navigate = useNavigate();

  return (
    <Button
      appearance="positive"
      className={className}
      hasIcon
      onClick={() => navigate(`/ui/project/${project}/storage/create`)}
    >
      Create storage pool
    </Button>
  );
};

export default AddStorageBtn;
