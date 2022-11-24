import React, { FC, useState } from "react";
import { LxdSnapshot } from "../../types/instance";
import { deleteSnapshot } from "../../api/snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";
import { NotificationHelper } from "../../types/notification";
import { handleShiftClick } from "../../util/helpers";
import ConfirmationModal from "../../modals/ConfirmationModal";

type Props = {
  instanceName: string;
  snapshot: LxdSnapshot;
  notify: NotificationHelper;
};

const DeleteSnapshotBtn: FC<Props> = ({ instanceName, snapshot, notify }) => {
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setLoading(true);
    deleteSnapshot(instanceName, snapshot)
      .then(() => {
        setLoading(false);
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKeys.instances,
        });
        notify.success("Snapshot deleted.");
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on snapshot delete.", e);
      })
      .finally(() => setConfirmationModalOpen(false));
  };

  return (
    <>
      <button
        onClick={(e) =>
          handleShiftClick(e, handleDelete, () =>
            setConfirmationModalOpen(true)
          )
        }
        className="is-dense"
      >
        <i
          className={
            isLoading ? "p-icon--spinner u-animation--spin" : "p-icon--delete"
          }
        >
          Delete
        </i>
      </button>
      {isConfirmationModalOpen && (
        <ConfirmationModal
          title="Confirm delete"
          onClose={() => setConfirmationModalOpen(false)}
          confirmationMessage={`Are you sure you want to delete snapshot "${snapshot.name}"?
            This action cannot be undone, and can result in data loss.`}
          negButtonLabel="Cancel"
          posButtonLabel="Delete"
          onPositive={handleDelete}
        />
      )}
    </>
  );
};

export default DeleteSnapshotBtn;
