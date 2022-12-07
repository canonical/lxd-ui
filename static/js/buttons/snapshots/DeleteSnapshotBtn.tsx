import React, { FC, useState } from "react";
import { LxdSnapshot } from "../../types/instance";
import { deleteSnapshot } from "../../api/snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";
import { NotificationHelper } from "../../types/notification";
import ConfirmationButton from "../ConfirmationButton";

interface Props {
  instanceName: string;
  snapshot: LxdSnapshot;
  notify: NotificationHelper;
}

const DeleteSnapshotBtn: FC<Props> = ({ instanceName, snapshot, notify }) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setLoading(true);
    deleteSnapshot(instanceName, snapshot)
      .then(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKeys.instances,
        });
        notify.success("Snapshot deleted.");
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
      title="Confirm delete"
      toggleAppearance="base"
      toggleCaption="Delete snapshot"
      confirmationMessage={`Are you sure you want to delete snapshot "${snapshot.name}"?
                            This action cannot be undone, and can result in data loss.`}
      posButtonLabel="Delete"
      onConfirm={handleDelete}
    />
  );
};

export default DeleteSnapshotBtn;
