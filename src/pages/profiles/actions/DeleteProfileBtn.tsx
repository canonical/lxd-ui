import React, { FC, useState } from "react";
import ConfirmationButton from "components/ConfirmationButton";
import { deleteProfile } from "api/profiles";
import { useNavigate } from "react-router-dom";
import { LxdProfile } from "types/profile";
import { useNotify } from "context/notify";
import ItemName from "components/ItemName";

interface Props {
  profile: LxdProfile;
  project: string;
  featuresProfiles: boolean;
}

const DeleteProfileBtn: FC<Props> = ({
  profile,
  project,
  featuresProfiles,
}) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = () => {
    setLoading(true);
    deleteProfile(profile.name, project)
      .then(() => {
        setLoading(false);
        navigate(
          `/ui/project/${project}/profiles`,
          notify.queue(notify.success(`Profile ${profile.name} deleted.`))
        );
      })
      .catch((e) => notify.failure("Profile deletion failed", e))
      .finally(() => setLoading(false));
  };

  return (
    <ConfirmationButton
      onHoverText="Delete profile"
      toggleAppearance="base"
      className="delete-profile-btn"
      isLoading={isLoading}
      icon="delete"
      title="Confirm delete"
      confirmMessage={
        <>
          Are you sure you want to delete profile{" "}
          <ItemName item={profile} bold />?{"\n"}This action cannot be undone,
          and can result in data loss.
        </>
      }
      confirmButtonLabel="Delete"
      onConfirm={handleDelete}
      isDisabled={profile.name === "default" || !featuresProfiles}
      isDense
    />
  );
};

export default DeleteProfileBtn;
