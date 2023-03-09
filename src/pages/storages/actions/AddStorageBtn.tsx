import React, { FC } from "react";
import { Button } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";

interface Props {
  project: string;
}

const AddStorageBtn: FC<Props> = ({ project }) => {
  const panelParams = usePanelParams();

  return (
    <Button
      appearance="positive"
      className="u-no-margin--bottom"
      hasIcon
      onClick={() => panelParams.openStorageForm(project)}
    >
      Add storage
    </Button>
  );
};

export default AddStorageBtn;
