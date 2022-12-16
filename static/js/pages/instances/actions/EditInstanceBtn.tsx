import React, { FC } from "react";
import { LxdInstance } from "types/instance";
import { Button } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";

interface Props {
  instance: LxdInstance;
  isDense?: boolean;
  label?: string;
}

const EditInstanceBtn: FC<Props> = ({
  instance,
  isDense = true,
  label = "Edit",
}) => {
  const panelParams = usePanelParams();

  return (
    <Button
      className="u-no-margin--bottom"
      dense={isDense}
      hasIcon
      onClick={() => panelParams.openInstanceFormYaml(instance.name)}
    >
      <i className={"p-icon--edit"} />
      {label && <span>{label}</span>}
    </Button>
  );
};

export default EditInstanceBtn;
