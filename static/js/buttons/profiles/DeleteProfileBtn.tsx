import React, { FC, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";
import { NotificationHelper } from "../../types/notification";
import ConfirmationButton from "../ConfirmationButton";
import { deleteProfile } from "../../api/profiles";

interface Props {
  name: string;
  notify: NotificationHelper;
  appearance?: string;
  className?: string;
  isDense?: boolean;
  label?: string;
}

const DeleteProfileBtn: FC<Props> = ({
  name,
  notify,
  appearance = "base",
  className = "p-contextual-menu__link",
  isDense = true,
  label = "Delete profile",
}) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setLoading(true);
    deleteProfile(name)
      .then(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.profiles],
        });
        notify.success("Profile deleted.");
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on profile delete.", e);
      });
  };

  return (
    <ConfirmationButton
      className={className}
      isLoading={isLoading}
      iconClass="p-icon--delete"
      iconDescription="Delete"
      title="Confirm delete"
      toggleAppearance={appearance}
      toggleCaption={label}
      confirmationMessage={`Are you sure you want to delete profile "${name}"?
                            This action cannot be undone, and can result in data loss.`}
      posButtonLabel="Delete"
      onConfirm={handleDelete}
      isDense={isDense}
    />
  );
};

export default DeleteProfileBtn;
