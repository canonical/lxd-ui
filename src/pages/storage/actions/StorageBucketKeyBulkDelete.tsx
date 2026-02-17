import type { FC } from "react";
import { useState } from "react";
import { pluralize } from "util/instanceBulkActions";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import BulkDeleteButton from "components/BulkDeleteButton";
import { useToastNotification } from "@canonical/react-components";
import type { LxdStorageBucket, LxdStorageBucketKey } from "types/storage";
import { deleteStorageBucketKeyBulk } from "api/storage-buckets";
import { getPromiseSettledCounts } from "util/promises";
import { useCurrentProject } from "context/useCurrentProject";
import ResourceLink from "components/ResourceLink";
import { getStorageBucketURL } from "util/storageBucket";
import { useBulkDetails } from "context/useBulkDetails";

interface Props {
  keys: LxdStorageBucketKey[];
  bucket: LxdStorageBucket;
  onStart: () => void;
  onFinish: () => void;
}

const StorageBucketKeyBulkDelete: FC<Props> = ({
  keys,
  bucket,
  onStart,
  onFinish,
}) => {
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const viewBulkDetails = useBulkDetails();
  const { project } = useCurrentProject();
  const projectName = project?.name || "";
  const totalCount = keys.length;

  const buttonText = `Delete ${keys.length} ${pluralize("key", keys.length)}`;

  const handleDelete = () => {
    setLoading(true);
    onStart();
    const successMessage = (
      <>
        {keys.length} {pluralize("key", keys.length)} deleted for bucket{" "}
        <ResourceLink
          type="bucket"
          value={bucket.name}
          to={getStorageBucketURL(
            bucket.name,
            bucket.pool,
            project?.name ?? "",
          )}
        />
        .
      </>
    );

    deleteStorageBucketKeyBulk(bucket, keys, projectName)
      .then((results) => {
        const { fulfilledCount, rejectedCount } =
          getPromiseSettledCounts(results);

        if (fulfilledCount === totalCount) {
          toastNotify.success(successMessage, viewBulkDetails(results));
        } else if (rejectedCount === totalCount) {
          toastNotify.failure(
            "Key bulk deletion failed",
            undefined,
            <>
              <b>{totalCount}</b> {pluralize("key", totalCount)} could not be
              deleted.
            </>,
            viewBulkDetails(results),
          );
        } else {
          toastNotify.failure(
            "Key bulk deletion partially failed",
            undefined,
            <>
              <b>{fulfilledCount}</b> {pluralize("key", fulfilledCount)}{" "}
              deleted.
              <br />
              <b>{rejectedCount}</b> {pluralize("key", rejectedCount)} could not
              be deleted.
            </>,
            viewBulkDetails(results),
          );
        }

        queryClient.invalidateQueries({
          queryKey: [
            queryKeys.storage,
            bucket.pool,
            project?.name ?? "",
            queryKeys.buckets,
            bucket.name,
            queryKeys.keys,
          ],
        });
        setLoading(false);
        onFinish();
      })
      .catch((e) => {
        setLoading(false);
        toastNotify.failure(
          `Key bulk deletion failed for storage bucket ${bucket.name}`,
          e,
        );
      });
  };

  return (
    <BulkDeleteButton
      entities={keys}
      deletableEntities={keys}
      entityType="key"
      onDelete={handleDelete}
      disabledReason={
        totalCount === 0
          ? `You do not have permission to delete the selected ${pluralize("key", keys.length)}`
          : undefined
      }
      confirmationButtonProps={{
        disabled: isLoading || totalCount === 0,
        loading: isLoading,
      }}
      buttonLabel={buttonText}
    />
  );
};

export default StorageBucketKeyBulkDelete;
