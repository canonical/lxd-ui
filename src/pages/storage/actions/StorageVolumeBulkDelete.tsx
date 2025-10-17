import type { FC } from "react";
import { useState } from "react";
import { pluralize } from "util/instanceBulkActions";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import BulkDeleteButton from "components/BulkDeleteButton";
import { useToastNotification } from "@canonical/react-components";
import type { LxdStorageVolume } from "types/storage";
import { getPromiseSettledCounts } from "util/promises";
import { useCurrentProject } from "context/useCurrentProject";
import { deleteStorageVolumeBulk } from "api/storage-volumes";
import { useStorageVolumeEntitlements } from "util/entitlements/storage-volumes";
import { useBulkDetails } from "context/useBulkDetails";

interface Props {
  volumes: LxdStorageVolume[];
  onStart: () => void;
  onFinish: () => void;
}

const StorageVolumeBulkDelete: FC<Props> = ({ volumes, onStart, onFinish }) => {
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const { canDeleteVolume } = useStorageVolumeEntitlements();
  const viewBulkDetails = useBulkDetails();
  const { project } = useCurrentProject();
  const projectName = project?.name || "";

  const deletableVolumes = volumes.filter((volume) => canDeleteVolume(volume));
  const totalCount = volumes.length;
  const deleteCount = deletableVolumes.length;

  const buttonText = `Delete ${volumes.length} ${pluralize("volume", volumes.length)}`;

  const handleDelete = () => {
    setLoading(true);
    onStart();
    const successMessage = `${deletableVolumes.length} ${pluralize("volume", deletableVolumes.length)} successfully deleted`;

    deleteStorageVolumeBulk(deletableVolumes, projectName)
      .then((results) => {
        const { fulfilledCount, rejectedCount } =
          getPromiseSettledCounts(results);

        if (fulfilledCount === deleteCount) {
          toastNotify.success(successMessage, viewBulkDetails(results));
        } else if (rejectedCount === deleteCount) {
          toastNotify.failure(
            "Volume bulk deletion failed",
            undefined,
            <>
              <b>{deleteCount}</b> {pluralize("volume", deleteCount)} could not
              be deleted.
            </>,
            viewBulkDetails(results),
          );
        } else {
          toastNotify.failure(
            "Volume bulk deletion partially failed",
            undefined,
            <>
              <b>{fulfilledCount}</b> {pluralize("volume", fulfilledCount)}{" "}
              deleted.
              <br />
              <b>{rejectedCount}</b> {pluralize("volume", rejectedCount)} could
              not be deleted.
            </>,
            viewBulkDetails(results),
          );
        }

        queryClient.invalidateQueries({
          queryKey: [queryKeys.volumes, projectName],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKeys.isoVolumes],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKeys.projects, project],
        });
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKeys.volumes,
        });
        setLoading(false);
        onFinish();
      })
      .catch((e) => {
        setLoading(false);
        toastNotify.failure("Volume bulk deletion failed", e);
      });
  };

  const getBulkDeleteBreakdown = () => {
    if (deleteCount === totalCount) {
      return undefined;
    }

    const restrictedCount = totalCount - deleteCount;
    return [
      `${deleteCount} ${pluralize("volume", deleteCount)} will be deleted.`,
      `${restrictedCount} ${pluralize("volume", restrictedCount)} that you do not have permission to delete will be ignored.`,
    ];
  };

  return (
    <BulkDeleteButton
      entities={volumes}
      deletableEntities={deletableVolumes}
      entityType="volume"
      onDelete={handleDelete}
      disabledReason={
        deleteCount === 0
          ? `You do not have permission to delete the selected ${pluralize("volume", volumes.length)}`
          : undefined
      }
      confirmationButtonProps={{
        disabled: isLoading || deleteCount === 0,
        loading: isLoading,
      }}
      buttonLabel={buttonText}
      bulkDeleteBreakdown={getBulkDeleteBreakdown()}
      className="u-no-margin--bottom"
    />
  );
};

export default StorageVolumeBulkDelete;
