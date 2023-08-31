import React, { FC } from "react";
import { Button, useNotify } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";

interface Props {
  project: string;
  className?: string;
}

const AddStorageBtn: FC<Props> = ({ project, className }) => {
  const notify = useNotify();
  const panelParams = usePanelParams();

  const handleAdd = () => {
    notify.clear();
    panelParams.openStorageForm(project);
  };

  return (
    <Button
      appearance="positive"
      className={className}
      hasIcon
      onClick={handleAdd}
    >
      Create storage pool
    </Button>
  );
};

export default AddStorageBtn;
