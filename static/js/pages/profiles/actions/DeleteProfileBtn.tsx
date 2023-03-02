import React, { FC, useState } from "react";
import ConfirmationButton from "components/ConfirmationButton";
import { deleteProfile } from "api/profiles";
import { useNavigate } from "react-router-dom";
import { LxdProfile } from "types/profile";
import useNotify from "util/useNotify";

interface Props {
  profile: LxdProfile;
  project: string;
}

const DeleteProfileBtn: FC<Props> = ({ profile, project }) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = () => {
    setLoading(true);
    deleteProfile(profile.name, project)
      .then(() => {
        setLoading(false);
        navigate(
          `/ui/${project}/profiles`,
          notify.queue(notify.success(`Profile ${profile.name} deleted.`))
        );
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on profile delete.", e);
      });
  };

  return (
    <ConfirmationButton
      className="u-no-margin--bottom"
      isLoading={isLoading}
      iconClass="p-icon--delete"
      iconDescription="Delete"
      title="Confirm delete"
      toggleCaption="Delete"
      confirmationMessage={`Are you sure you want to delete profile "${profile.name}"? This action cannot be undone, and can result in data loss.`}
      posButtonLabel="Delete"
      onConfirm={handleDelete}
      isDense={false}
    />
  );
};

export default DeleteProfileBtn;
