import React, { FC, useState } from "react";
import ConfirmationButton from "components/ConfirmationButton";
import { deleteProfile } from "api/profiles";
import { useNavigate } from "react-router-dom";
import { LxdProfile } from "types/profile";
import ItemName from "components/ItemName";
import { useDeleteIcon } from "context/useDeleteIcon";
import { useNotify } from "@canonical/react-components";

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
  const isDeleteIcon = useDeleteIcon();
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

  const isDefaultProfile = profile.name === "default";
  const getHoverText = () => {
    if (!featuresProfiles) {
      return "Modifications are only available in the default project";
    }
    if (isDefaultProfile) {
      return "The default profile cannot be deleted";
    }
    return "Delete profile";
  };

  return (
    <ConfirmationButton
      onHoverText={getHoverText()}
      toggleAppearance={isDeleteIcon ? "base" : "default"}
      className="u-no-margin--bottom"
      isLoading={isLoading}
      title="Confirm delete"
      toggleCaption={isDeleteIcon ? undefined : "Delete profile"}
      confirmMessage={
        <>
          This will permanently delete profile <ItemName item={profile} bold />.
          {"\n"}This action cannot be undone, and can result in data loss.
        </>
      }
      confirmButtonLabel="Delete"
      onConfirm={handleDelete}
      isDisabled={isDefaultProfile || !featuresProfiles}
      isDense={false}
      icon={isDeleteIcon ? "delete" : undefined}
    />
  );
};

export default DeleteProfileBtn;
