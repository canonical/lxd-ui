import React, { FC } from "react";
import { Button } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";
import { LxdProfile } from "types/profile";

interface Props {
  profile: LxdProfile;
}

const EditProfileBtn: FC<Props> = ({ profile }) => {
  const panelParams = usePanelParams();

  return (
    <Button
      className="u-no-margin--bottom"
      hasIcon
      onClick={() => panelParams.openProfileFormYaml(profile.name)}
    >
      <i className={"p-icon--edit"} />
      <span>Edit</span>
    </Button>
  );
};

export default EditProfileBtn;
