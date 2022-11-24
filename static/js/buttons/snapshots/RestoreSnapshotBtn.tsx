import React, { FC, useState } from "react";
import { LxdSnapshot } from "../../types/instance";
import { restoreSnapshot } from "../../api/snapshots";
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

const RestoreSnapshotBtn: FC<Props> = ({ instanceName, snapshot, notify }) => {
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleRestore = () => {
    setLoading(true);
    restoreSnapshot(instanceName, snapshot)
      .then(() => {
        setLoading(false);
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKeys.instances,
        });
        notify.success("Snapshot restored.");
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on snapshot restore.", e);
      })
      .finally(() => setConfirmationModalOpen(false));
  };

  return (
    <>
      <button
        onClick={(e) =>
          handleShiftClick(e, handleRestore, () =>
            setConfirmationModalOpen(true)
          )
        }
        className="is-dense"
      >
        <i
          className={
            isLoading ? "p-icon--spinner u-animation--spin" : "p-icon--export"
          }
        >
          Restore
        </i>
      </button>
      {isConfirmationModalOpen && (
        <ConfirmationModal
          title="Confirm restore"
          onClose={() => setConfirmationModalOpen(false)}
          confirmationMessage={`Are you sure you want to restore snapshot "${snapshot.name}"?
            This action cannot be undone, and can result in data loss.`}
          negButtonLabel="Cancel"
          posButtonLabel="Restore"
          onPositive={handleRestore}
        />
      )}
    </>
  );
};

export default RestoreSnapshotBtn;
