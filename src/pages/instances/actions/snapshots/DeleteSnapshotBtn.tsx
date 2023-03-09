import React, { FC, useState } from "react";
import { LxdInstance, LxdSnapshot } from "types/instance";
import { deleteSnapshot } from "api/snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import ConfirmationButton from "components/ConfirmationButton";
import { useNotify } from "context/notify";

interface Props {
  instance: LxdInstance;
  snapshot: LxdSnapshot;
}

const DeleteSnapshotBtn: FC<Props> = ({ instance, snapshot }) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setLoading(true);
    deleteSnapshot(instance, snapshot)
      .then(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKeys.instances,
        });
        notify.success(`Snapshot ${snapshot.name} deleted.`);
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on snapshot delete.", e);
      });
  };

  return (
    <ConfirmationButton
      isLoading={isLoading}
      iconClass="p-icon--delete"
      iconDescription="Delete"
      title="Confirm delete"
      toggleCaption="Delete"
      confirmationMessage={`Are you sure you want to delete snapshot "${snapshot.name}"? This action cannot be undone, and can result in data loss.`}
      posButtonLabel="Delete"
      onConfirm={handleDelete}
    />
  );
};

export default DeleteSnapshotBtn;
