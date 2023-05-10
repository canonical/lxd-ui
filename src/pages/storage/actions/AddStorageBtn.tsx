import React, { FC } from "react";
import { Button } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";

interface Props {
  project: string;
  className?: string;
}

const AddStorageBtn: FC<Props> = ({ project, className }) => {
  const panelParams = usePanelParams();

  return (
    <Button
      appearance="positive"
      className={className}
      hasIcon
      onClick={() => panelParams.openStorageForm(project)}
    >
      Add storage
    </Button>
  );
};

export default AddStorageBtn;
