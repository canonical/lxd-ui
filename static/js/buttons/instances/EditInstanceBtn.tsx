import React, { FC } from "react";
import { LxdInstance } from "../../types/instance";
import { Button } from "@canonical/react-components";
import usePanelParams from "../../util/usePanelParams";

interface Props {
  instance: LxdInstance;
}

const EditInstanceBtn: FC<Props> = ({ instance }) => {
  const panelParams = usePanelParams();

  return (
    <Button
      appearance="base"
      dense
      hasIcon
      onClick={() => panelParams.openInstanceFormYaml(instance.name)}
    >
      <i className={"p-icon--edit"} />
      <span>Edit instance</span>
    </Button>
  );
};

export default EditInstanceBtn;
