import React, { FC, useState } from "react";
import ConfirmationButton from "components/ConfirmationButton";
import { LxdStorage } from "types/storage";
import { deleteStoragePool } from "api/storage-pools";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNotify } from "context/notify";
import ItemName from "components/ItemName";

interface Props {
  storage: LxdStorage;
  project: string;
}

const DeleteStorageBtn: FC<Props> = ({ storage, project }) => {
  const notify = useNotify();
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
        notify.success(
          <>
            Storage pool <ItemName item={storage} bold /> deleted.
          </>
        );
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Storage pool deletion failed", e);
      });
  };

  return (
    <ConfirmationButton
      toggleAppearance="base"
      className="u-no-margin--bottom"
      isLoading={isLoading}
      icon="delete"
      title="Confirm delete"
      confirmMessage={
        <>
          Are you sure you want to delete storage{" "}
          <ItemName item={storage} bold />?{"\n"}This action cannot be undone,
          and can result in data loss.
        </>
      }
      confirmButtonLabel="Delete"
      onConfirm={handleDelete}
      isDense={true}
    />
  );
};

export default DeleteStorageBtn;
