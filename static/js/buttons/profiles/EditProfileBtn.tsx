import React, { FC } from "react";
import { Button } from "@canonical/react-components";
import usePanelParams from "../../util/usePanelParams";
import { LxdProfile } from "../../types/profile";

interface Props {
  profile: LxdProfile;
  appearance?: string;
  className?: string;
  isDense?: boolean;
  label?: string;
}

const EditProfileBtn: FC<Props> = ({
  profile,
  appearance = "base",
  className = "p-contextual-menu__link",
  isDense = true,
  label = "Edit profile",
}) => {
  const panelParams = usePanelParams();

  return (
    <Button
      appearance={appearance}
      className={className}
      dense={isDense}
      hasIcon
      onClick={() => panelParams.openProfileFormYaml(profile.name)}
    >
      <i className={"p-icon--edit"} />
      {label && <span>{label}</span>}
    </Button>
  );
};

export default EditProfileBtn;
