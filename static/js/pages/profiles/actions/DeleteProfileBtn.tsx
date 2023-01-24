import React, { FC, useState } from "react";
import { NotificationHelper } from "types/notification";
import ConfirmationButton from "components/ConfirmationButton";
import { deleteProfile } from "api/profiles";
import { useNavigate } from "react-router-dom";
import { LxdProfile } from "types/profile";

interface Props {
  profile: LxdProfile;
  notify: NotificationHelper;
}

const DeleteProfileBtn: FC<Props> = ({ profile, notify }) => {
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = () => {
    setLoading(true);
    deleteProfile(profile.name)
      .then(() => {
        setLoading(false);
        notify.success("Profile deleted.");
        navigate("/ui/profiles");
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
