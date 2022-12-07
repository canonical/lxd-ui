import React, { FC, useState } from "react";
import { LxdSnapshot } from "../../types/instance";
import { restoreSnapshot } from "../../api/snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";
import { NotificationHelper } from "../../types/notification";
import ConfirmationButton from "../ConfirmationButton";

interface Props {
  instanceName: string;
  snapshot: LxdSnapshot;
  notify: NotificationHelper;
}

const RestoreSnapshotBtn: FC<Props> = ({ instanceName, snapshot, notify }) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleRestore = () => {
    setLoading(true);
    restoreSnapshot(instanceName, snapshot)
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
      title="Confirm restore"
      toggleAppearance="base"
      toggleCaption="Restore snapshot"
      confirmationMessage={`Are you sure you want to restore snapshot "${snapshot.name}"?
                            This action cannot be undone, and can result in data loss.`}
      posButtonLabel="Restore"
      onConfirm={handleRestore}
    />
  );
};

export default RestoreSnapshotBtn;
