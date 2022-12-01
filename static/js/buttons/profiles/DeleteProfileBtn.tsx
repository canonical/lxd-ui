import React, { FC, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";
import { NotificationHelper } from "../../types/notification";
import ConfirmationButton from "../ConfirmationButton";
import { deleteProfile } from "../../api/profiles";

type Props = {
  name: string;
  notify: NotificationHelper;
};

const DeleteProfileBtn: FC<Props> = ({ name, notify }) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setLoading(true);
    deleteProfile(name)
      .then(() => {
        setLoading(false);
        queryClient.invalidateQueries({
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
      isLoading={isLoading}
      iconClass="p-icon--delete"
      title="Confirm delete"
      confirmationMessage={`Are you sure you want to delete profile "${name}"?
                            This action cannot be undone, and can result in data loss.`}
      posButtonLabel="Delete"
      onPositive={handleDelete}
    />
  );
};

export default DeleteProfileBtn;
