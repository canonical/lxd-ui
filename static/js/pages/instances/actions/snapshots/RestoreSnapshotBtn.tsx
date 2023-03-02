import React, { FC, useState } from "react";
import { LxdInstance, LxdSnapshot } from "types/instance";
import { restoreSnapshot } from "api/snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import ConfirmationButton from "components/ConfirmationButton";
import useNotify from "util/useNotify";

interface Props {
  instance: LxdInstance;
  snapshot: LxdSnapshot;
}

const RestoreSnapshotBtn: FC<Props> = ({ instance, snapshot }) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleRestore = () => {
    setLoading(true);
    restoreSnapshot(instance, snapshot)
      .then(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKeys.instances,
        });
        notify.success("Snapshot restored.");
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on snapshot restore.", e);
      });
  };

  return (
    <ConfirmationButton
      isLoading={isLoading}
      iconClass="p-icon--export"
      iconDescription="Restore"
      title="Confirm restore"
      toggleCaption="Restore"
      confirmationMessage={`Are you sure you want to restore snapshot "${snapshot.name}"? This action cannot be undone, and can result in data loss.`}
      posButtonLabel="Restore"
      onConfirm={handleRestore}
    />
  );
};

export default RestoreSnapshotBtn;
