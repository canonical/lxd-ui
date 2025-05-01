import type { FC } from "react";
import { useState } from "react";
import { pluralize } from "util/instanceBulkActions";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import BulkDeleteButton from "components/BulkDeleteButton";
import { useToastNotification } from "@canonical/react-components";
import type { LxdStorageBucket } from "types/storage";
import { useStorageBucketEntitlements } from "util/entitlements/storage-buckets";
import { deleteStorageBucketBulk } from "api/storage-buckets";
import { getPromiseSettledCounts } from "util/promises";
import { useCurrentProject } from "context/useCurrentProject";

interface Props {
  buckets: LxdStorageBucket[];
  onStart: () => void;
  onFinish: () => void;
}

const StorageBucketBulkDelete: FC<Props> = ({ buckets, onStart, onFinish }) => {
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const { canDeleteBucket } = useStorageBucketEntitlements();
  const { project } = useCurrentProject();
  const projectName = project?.name || "";

  const deleteableBuckets = buckets.filter((bucket) => canDeleteBucket(bucket));
  const totalCount = buckets.length;
  const deleteCount = deleteableBuckets.length;

  const buttonText = `Delete ${buckets.length} ${pluralize("bucket", buckets.length)}`;

  const handleDelete = () => {
    setLoading(true);
    onStart();
    const successMessage = `${deleteableBuckets.length} ${pluralize("bucket", deleteableBuckets.length)} successfully deleted`;

    deleteStorageBucketBulk(deleteableBuckets, projectName)
      .then((results) => {
        const { fulfilledCount, rejectedCount } =
          getPromiseSettledCounts(results);

        if (fulfilledCount === deleteCount) {
          toastNotify.success(successMessage);
        } else if (rejectedCount === deleteCount) {
          toastNotify.failure(
            "Bucket bulk deletion failed",
            undefined,
            <>
              <b>{deleteCount}</b> {pluralize("bucket", deleteCount)} could not
              be deleted.
            </>,
          );
        } else {
          toastNotify.failure(
            "Bucket bulk deletion partially failed",
            undefined,
            <>
              <b>{fulfilledCount}</b> {pluralize("bucket", fulfilledCount)}{" "}
              deleted.
              <br />
              <b>{rejectedCount}</b> {pluralize("bucket", rejectedCount)} could
              not be deleted.
            </>,
          );
        }

        queryClient.invalidateQueries({
          queryKey: [queryKeys.buckets, projectName],
        });
        setLoading(false);
        onFinish();
      })
      .catch((e) => {
        setLoading(false);
        toastNotify.failure("Bucket bulk deletion failed", e);
      });
  };

  const getBulkDeleteBreakdown = () => {
    if (deleteCount === totalCount) {
      return undefined;
    }

    const restrictedCount = totalCount - deleteCount;
    return [
      `${deleteCount} ${pluralize("image", deleteCount)} will be deleted.`,
      `${restrictedCount} ${pluralize("image", restrictedCount)} that you do not have permission to delete will be ignored.`,
    ];
  };

  return (
    <BulkDeleteButton
      entities={buckets}
      deletableEntities={deleteableBuckets}
      entityType="bucket"
      onDelete={handleDelete}
      disabledReason={
        deleteCount === 0
          ? `You do not have permission to delete the selected ${pluralize("bucket", buckets.length)}`
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

export default StorageBucketBulkDelete;
