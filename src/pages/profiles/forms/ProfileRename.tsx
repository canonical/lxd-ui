import React, { FC, useState } from "react";
import { Button, Input } from "@canonical/react-components";
import { useNotify } from "context/notify";
import { useNavigate } from "react-router-dom";
import { LxdProfile } from "types/profile";
import { renameProfile } from "api/profiles";
import SubmitButton from "components/SubmitButton";

interface Props {
  profile: LxdProfile;
  project: string;
  closeForm: () => void;
}

const ProfileRename: FC<Props> = ({ profile, project, closeForm }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const [name, setName] = useState(profile.name);
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (profile.name === name) {
      closeForm();
      return;
    }
    setSubmitting(true);
    renameProfile(profile.name, name, project)
      .then(() => {
        navigate(
          `/ui/${project}/profiles/detail/${name}`,
          notify.queue(notify.success("Profile renamed."))
        );
        closeForm();
      })
      .catch((e) => notify.failure("Renaming failed", e))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="profile-rename">
      <Input
        autoFocus
        className="u-no-margin--bottom name-input"
        onChange={(e) => setName(e.target.value)}
        onKeyUp={(e) => e.key === "Enter" && handleSubmit()}
        type="text"
        value={name}
      />
      <Button appearance="base" className="cancel" dense onClick={closeForm}>
        Cancel
      </Button>
      <SubmitButton
        isSubmitting={isSubmitting}
        isDisabled={false}
        buttonLabel="Save"
        onClick={handleSubmit}
        dense
      />
    </div>
  );
};

export default ProfileRename;
