import React, { FC } from "react";
import { Button } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";
import { LxdProfile } from "types/profile";

interface Props {
  profile: LxdProfile;
  project: string;
}

const EditProfileBtn: FC<Props> = ({ profile, project }) => {
  const panelParams = usePanelParams();

  return (
    <Button
      className="u-no-margin--bottom"
      hasIcon
      onClick={() => panelParams.openProfileFormYaml(profile.name, project)}
    >
      <i className={"p-icon--edit"} />
      <span>Edit</span>
    </Button>
  );
};

export default EditProfileBtn;
