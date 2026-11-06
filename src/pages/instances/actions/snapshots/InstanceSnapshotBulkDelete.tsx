import { useState, type FC, type ReactNode } from "react";
import type { LxdInstance } from "types/instance";
import { deleteInstanceSnapshotBulk } from "api/instance-snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { pluralize } from "util/helpers";
import { useEventQueue } from "context/eventQueue";
import { getPromiseSettledCounts } from "util/promises";
import { useInstanceEntitlements } from "util/entitlements/instances";
import BulkDeleteButton from "components/BulkDeleteButton";
import { useBulkDetails } from "context/useBulkDetails";
import type { NotificationAction } from "@canonical/react-components";
import {
  getCustomVolumeDevices,
  getCustomVolumeSnapshotDevices,
  isInstanceSnapshotQuery,
} from "util/instanceSnapshots";
import CustomDiskDevicesCheckbox from "./CustomDiskDevicesCheckbox";

interface Props {
  instance: LxdInstance;
  snapshotNames: string[];
  onStart: () => void;
  onFinish: () => void;
  onSuccess: (message: ReactNode, actions?: NotificationAction[]) => void;
  onFailure: (
    title: string,
    e: unknown,
    message?: ReactNode,
    actions?: NotificationAction[],
  ) => void;
}

const InstanceSnapshotBulkDelete: FC<Props> = ({
  instance,
  snapshotNames,
  onStart,
  onFinish,
  onSuccess,
  onFailure,
}) => {
  const eventQueue = useEventQueue();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { canManageInstanceSnapshots } = useInstanceEntitlements();
  const viewBulkDetails = useBulkDetails();

  const [deleteCustomVolumes, setDeleteCustomVolumes] = useState(true);
  const count = snapshotNames.length;
  const customVolumeSnapshots = (instance.snapshots ?? []).filter(
    (snapshot) =>
      snapshotNames.includes(snapshot.name) &&
      getCustomVolumeSnapshotDevices(snapshot).length > 0,
  );
  const customVolumeDevices = [
    ...new Set(customVolumeSnapshots.flatMap(getCustomVolumeSnapshotDevices)),
  ].sort();

  const handleDelete = () => {
    const customVolumeSnapshotNames = deleteCustomVolumes
      ? customVolumeSnapshots.map((snapshot) => snapshot.name)
      : [];
    setLoading(true);
    onStart();
    deleteInstanceSnapshotBulk(
      instance,
      snapshotNames,
      eventQueue,
      customVolumeSnapshotNames,
    )
      .then((results) => {
        const { fulfilledCount, rejectedCount } =
          getPromiseSettledCounts(results);
        if (fulfilledCount === count) {
          onSuccess(
            <>
              <b>{snapshotNames.length}</b>{" "}
              {pluralize("snapshot", snapshotNames.length)} deleted
              {customVolumeSnapshotNames.length > 0 &&
                ", including snapshots of exclusively attached custom disk devices"}
              .
            </>,
            viewBulkDetails(results),
          );
        } else if (rejectedCount === count) {
          onFailure(
            "Snapshot bulk deletion failed",
            undefined,
            <>
              <b>{count}</b> {pluralize("snapshot", count)} could not be
              deleted.
            </>,
            viewBulkDetails(results),
          );
        } else {
          onFailure(
            "Snapshot bulk deletion partially failed",
            undefined,
            <>
              <b>{fulfilledCount}</b> {pluralize("snapshot", fulfilledCount)}{" "}
              deleted.
              <br />
              <b>{rejectedCount}</b> {pluralize("snapshot", rejectedCount)}{" "}
              could not be deleted.
            </>,
            viewBulkDetails(results),
          );
        }
        queryClient.invalidateQueries({
          predicate: isInstanceSnapshotQuery(
            customVolumeSnapshotNames.length > 0,
          ),
        });
        setLoading(false);
        onFinish();
      })
      .catch((e) => {
        onFailure("Snapshot bulk deletion failed", e);
        setLoading(false);
      });
  };

  return (
    <BulkDeleteButton
      confirmationButtonProps={{
        loading: isLoading,
        disabled: isLoading || !canManageInstanceSnapshots(instance),
        appearance: "",
      }}
      onDelete={handleDelete}
      entityType="snapshot"
      entities={snapshotNames}
      deletableEntities={snapshotNames}
      disabledReason={
        canManageInstanceSnapshots(instance)
          ? undefined
          : "You do not have permission to manage snapshots for this instance"
      }
      buttonLabel={`Delete ${pluralize("snapshot", snapshotNames.length)}`}
      onCancel={() => {
        setDeleteCustomVolumes(true);
      }}
      modalContentSuffix={
        customVolumeSnapshots.length > 0 && (
          <CustomDiskDevicesCheckbox
            id="bulk-delete-custom-volumes"
            label="Delete snapshots for custom disk devices attached to this instance"
            help={`${customVolumeSnapshots.length} of the selected ${pluralize("snapshot", count)} ${customVolumeSnapshots.length === 1 ? "has" : "have"} custom disk device snapshots.`}
            checked={deleteCustomVolumes}
            onChange={setDeleteCustomVolumes}
            includedDevices={customVolumeDevices}
            allDevices={getCustomVolumeDevices(instance)}
          />
        )
      }
    />
  );
};

export default InstanceSnapshotBulkDelete;
