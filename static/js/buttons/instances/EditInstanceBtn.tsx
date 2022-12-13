import React, { FC } from "react";
import { LxdInstance } from "../../types/instance";
import { Button } from "@canonical/react-components";
import usePanelParams from "../../util/usePanelParams";

interface Props {
  instance: LxdInstance;
  appearance?: string;
  className?: string;
  isDense?: boolean;
  label?: string;
}

const EditInstanceBtn: FC<Props> = ({
  instance,
  appearance = "base",
  className = "p-contextual-menu__link",
  isDense = true,
  label = "Edit instance",
}) => {
  const panelParams = usePanelParams();

  return (
    <Button
      appearance={appearance}
      className={className}
      dense={isDense}
      hasIcon
      onClick={() => panelParams.openInstanceFormYaml(instance.name)}
    >
      <i className={"p-icon--edit"} />
      <span>{label}</span>
    </Button>
  );
};

export default EditInstanceBtn;
