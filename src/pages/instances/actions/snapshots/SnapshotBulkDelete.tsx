import React, { FC, ReactNode, useState } from "react";
import { LxdInstance } from "types/instance";
import { deleteSnapshotBulk } from "api/snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import ConfirmationButton from "components/ConfirmationButton";

interface Props {
  instance: LxdInstance;
  snapshotNames: string[];
  onStart: () => void;
  onFinish: () => void;
  onSuccess: (message: ReactNode) => void;
  onFailure: (title: string, e: unknown) => void;
}

const SnapshotBulkDelete: FC<Props> = ({
  instance,
  snapshotNames,
  onStart,
  onFinish,
  onSuccess,
  onFailure,
}) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setLoading(true);
    onStart();
    deleteSnapshotBulk(instance, snapshotNames)
      .then(() =>
        onSuccess(
          <>
            <b>{snapshotNames.length}</b> snapshot
            {snapshotNames.length > 1 && "s"} deleted.
          </>
        )
      )
      .catch((e) => onFailure("Snapshot deletion failed.", e))
      .finally(() => {
        setLoading(false);
        onFinish();
        void queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKeys.instances,
        });
      });
  };

  return (
    <ConfirmationButton
      isLoading={isLoading}
      icon={isLoading ? "spinner" : undefined}
      title="Confirm delete"
      toggleCaption="Delete"
      confirmMessage={
        snapshotNames.length === 1 ? (
          <>
            <b>1</b> snapshot selected.{"\n"}Are you sure you want to delete it?
          </>
        ) : (
          <>
            <b>{snapshotNames.length}</b> snapshots selected.{"\n"}Are you sure
            you want to delete them?
          </>
        )
      }
      confirmButtonLabel="Delete"
      onConfirm={handleDelete}
      isDisabled={isLoading}
      isDense={false}
    />
  );
};

export default SnapshotBulkDelete;
