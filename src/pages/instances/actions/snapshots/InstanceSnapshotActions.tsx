import { useState, type FC, type ReactNode } from "react";
import type { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import {
  deleteInstanceSnapshot,
  restoreInstanceSnapshot,
} from "api/instance-snapshots";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckboxInput,
  ConfirmationButton,
  List,
} from "@canonical/react-components";
import classnames from "classnames";
import { useEventQueue } from "context/eventQueue";
import InstanceEditSnapshotBtn from "./InstanceEditSnapshotBtn";
import CreateImageFromInstanceSnapshotBtn from "pages/instances/actions/snapshots/CreateImageFromInstanceSnapshotBtn";
import CreateInstanceFromSnapshotBtn from "./CreateInstanceFromSnapshotBtn";
import ResourceLabel from "components/ResourceLabel";
import InstanceSnapshotLinkChip from "pages/instances/InstanceSnapshotLinkChip";
import { useInstanceEntitlements } from "util/entitlements/instances";
import { InstanceRichChip } from "pages/instances/InstanceRichChip";
import DsIcon from "components/DsIcon";
import {
  CUSTOM_DISK_DEVICES_MESSAGE_SUFFIX,
  getCustomVolumeDevices,
  getCustomVolumeSnapshotDevices,
  isInstanceSnapshotQuery,
} from "util/instanceSnapshots";
import CustomDiskDevicesCheckbox from "./CustomDiskDevicesCheckbox";

interface Props {
  instance: LxdInstance;
  snapshot: LxdInstanceSnapshot;
  onSuccess: (message: ReactNode) => void;
  onFailure: (title: string, e: unknown) => void;
}

const InstanceSnapshotActions: FC<Props> = ({
  instance,
  snapshot,
  onSuccess,
  onFailure,
}) => {
  const eventQueue = useEventQueue();
  const [isDeleting, setDeleting] = useState(false);
  const [isRestoring, setRestoring] = useState(false);
  const [restoreState, setRestoreState] = useState(true);
  const [restoreCustomVolumes, setRestoreCustomVolumes] = useState(true);
  const [deleteCustomVolumes, setDeleteCustomVolumes] = useState(true);
  const customVolumeDevices = getCustomVolumeSnapshotDevices(snapshot);
  const hasCustomVolumes = customVolumeDevices.length > 0;
  const attachedCustomVolumeDevices = getCustomVolumeDevices(instance);
  const queryClient = useQueryClient();
  const { canManageInstanceSnapshots } = useInstanceEntitlements();
  const disabledReason = canManageInstanceSnapshots(instance)
    ? undefined
    : "You do not have permission to manage snapshots for this instance";

  const handleDelete = () => {
    const includeCustomVolumes = hasCustomVolumes && deleteCustomVolumes;
    setDeleting(true);
    deleteInstanceSnapshot(instance, snapshot, includeCustomVolumes)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            onSuccess(
              <>
                Snapshot{" "}
                <ResourceLabel bold type="snapshot" value={snapshot.name} />{" "}
                deleted for instance{" "}
                <InstanceRichChip
                  instanceName={instance.name}
                  projectName={instance.project}
                />
                {includeCustomVolumes && CUSTOM_DISK_DEVICES_MESSAGE_SUFFIX}.
              </>,
            );
          },
          (msg) => {
            onFailure("Snapshot deletion failed", new Error(msg));
          },
          () => {
            setDeleting(false);
            queryClient.invalidateQueries({
              predicate: isInstanceSnapshotQuery(includeCustomVolumes),
            });
          },
        );
      })
      .catch((e) => {
        onFailure("Snapshot deletion failed", e);
        setDeleting(false);
      });
  };

  const handleRestore = () => {
    const includeCustomVolumes = hasCustomVolumes && restoreCustomVolumes;
    setRestoring(true);
    restoreInstanceSnapshot(
      instance,
      snapshot,
      restoreState,
      includeCustomVolumes,
    )
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            onSuccess(
              <>
                Snapshot{" "}
                <InstanceSnapshotLinkChip
                  name={snapshot.name}
                  instance={instance}
                />{" "}
                restored for instance{" "}
                <InstanceRichChip
                  instanceName={instance.name}
                  projectName={instance.project}
                />
                {includeCustomVolumes && CUSTOM_DISK_DEVICES_MESSAGE_SUFFIX}.
              </>,
            );
          },
          (msg) => {
            onFailure("Snapshot restore failed", new Error(msg));
          },
          () => {
            setRestoring(false);
            queryClient.invalidateQueries({
              predicate: isInstanceSnapshotQuery(includeCustomVolumes),
            });
          },
        );
      })
      .catch((e) => {
        onFailure("Snapshot restore failed", e);
        setRestoring(false);
      });
  };

  return (
    <>
      <List
        inline
        className={classnames("u-no-margin--bottom", "actions-list", {
          "u-snapshot-actions": !isDeleting && !isRestoring,
        })}
        items={[
          <InstanceEditSnapshotBtn
            key="edit"
            instance={instance}
            snapshot={snapshot}
            onSuccess={onSuccess}
            isDeleting={isDeleting}
            isRestoring={isRestoring}
            disabledReason={disabledReason}
          />,
          <ConfirmationButton
            key="restore"
            appearance="base"
            loading={isRestoring}
            className="has-icon is-dense"
            title="Confirm restore"
            confirmationModalProps={{
              title: "Confirm restore",
              children: (
                <>
                  <p>
                    This will restore snapshot{" "}
                    <ResourceLabel type="snapshot" value={snapshot.name} bold />
                    .
                    <br />
                    This action cannot be undone, and can result in data loss.
                  </p>
                  {snapshot.stateful && (
                    <CheckboxInput
                      label="Restore the instance state"
                      checked={restoreState}
                      onChange={() => {
                        setRestoreState((prev) => !prev);
                      }}
                    />
                  )}
                  {hasCustomVolumes && (
                    <CustomDiskDevicesCheckbox
                      id={`restore-custom-volumes-${snapshot.name}`}
                      label="Restore custom disk devices attached to this instance"
                      checked={restoreCustomVolumes}
                      onChange={setRestoreCustomVolumes}
                      includedDevices={customVolumeDevices}
                      allDevices={attachedCustomVolumeDevices}
                    />
                  )}
                </>
              ),
              confirmButtonLabel: disabledReason ?? "Restore snapshot",
              confirmButtonAppearance: "positive",
              close: () => {
                setRestoreState(true);
                setRestoreCustomVolumes(true);
              },
              onConfirm: handleRestore,
            }}
            disabled={isDeleting || isRestoring || !!disabledReason}
            shiftClickEnabled
            showShiftClickHint
          >
            <DsIcon icon="change-version" />
          </ConfirmationButton>,
          <CreateImageFromInstanceSnapshotBtn
            key="publish"
            instance={instance}
            snapshot={snapshot}
            isRestoring={isRestoring}
            isDeleting={isDeleting}
          />,
          <CreateInstanceFromSnapshotBtn
            key="duplicate"
            instance={instance}
            snapshot={snapshot}
            isDeleting={isDeleting}
            isRestoring={isRestoring}
          />,
          <ConfirmationButton
            key="delete"
            appearance="base"
            loading={isDeleting}
            className="has-icon is-dense"
            confirmationModalProps={{
              title: "Confirm delete",
              children: (
                <>
                  <p>
                    This will permanently delete snapshot{" "}
                    <ResourceLabel type="snapshot" value={snapshot.name} bold />
                    .
                    <br />
                    This action cannot be undone, and can result in data loss.
                  </p>
                  {hasCustomVolumes && (
                    <CustomDiskDevicesCheckbox
                      id={`delete-custom-volumes-${snapshot.name}`}
                      label="Delete snapshots for custom disk devices attached to this instance"
                      checked={deleteCustomVolumes}
                      onChange={setDeleteCustomVolumes}
                      includedDevices={customVolumeDevices}
                      allDevices={attachedCustomVolumeDevices}
                    />
                  )}
                </>
              ),
              confirmButtonLabel: disabledReason ?? "Delete snapshot",
              close: () => {
                setDeleteCustomVolumes(true);
              },
              onConfirm: handleDelete,
            }}
            disabled={isDeleting || isRestoring || !!disabledReason}
            shiftClickEnabled
            showShiftClickHint
          >
            <DsIcon icon="delete" />
          </ConfirmationButton>,
        ]}
      />
    </>
  );
};

export default InstanceSnapshotActions;
