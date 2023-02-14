import React, { FC, useState } from "react";
import { NotificationHelper } from "types/notification";
import ConfirmationButton from "components/ConfirmationButton";
import { LxdStorage } from "types/storage";
import { deleteStoragePool } from "api/storages";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";

interface Props {
  storage: LxdStorage;
  project: string;
  notify: NotificationHelper;
}

const DeleteStorageBtn: FC<Props> = ({ storage, project, notify }) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setLoading(true);
    deleteStoragePool(storage.name, project)
      .then(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.storage],
        });
        notify.success(`Storage pool ${storage.name} deleted.`);
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on storage delete.", e);
      });
  };

  return (
    <ConfirmationButton
      className="u-no-margin--bottom"
      isLoading={isLoading}
      iconClass="p-icon--delete"
      iconDescription="Delete"
      title="Confirm delete"
      confirmationMessage={`Are you sure you want to delete storage "${storage.name}"? This action cannot be undone, and can result in data loss.`}
      posButtonLabel="Delete"
      onConfirm={handleDelete}
      isDense={true}
    />
  );
};

export default DeleteStorageBtn;
