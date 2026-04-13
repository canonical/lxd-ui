import type { FC } from "react";
import { useState } from "react";
import type { LxdStorageBucket, LxdStorageBucketKey } from "types/storage";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useStorageBucketEntitlements } from "util/entitlements/storage-buckets";
import { deleteStorageBucketKey } from "api/storage-buckets";
import { useEventQueue } from "context/eventQueue";
import { useCurrentProject } from "context/useCurrentProject";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import ResourceLabel from "components/ResourceLabel";

interface Props {
  bucket: LxdStorageBucket;
  bucketKey: LxdStorageBucketKey;
}

const DeleteStorageBucketKeyBtn: FC<Props> = ({ bucket, bucketKey }) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { canEditBucket } = useStorageBucketEntitlements();
  const { project } = useCurrentProject();
  const projectName = project?.name || "";
  const toastNotify = useToastNotification();
  const { hasStorageAndNetworkOperations } = useSupportedFeatures();
  const eventQueue = useEventQueue();

  const invalidateCache = () => {
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
  };

  const onSuccess = () => {
    invalidateCache();
    setLoading(false);
    toastNotify.success(
      <>
        Key <ResourceLabel bold type="bucket-key" value={bucketKey.name} />{" "}
        deleted for storage bucket{" "}
        <ResourceLabel bold type="bucket" value={bucket.name} />.
      </>,
    );
  };

  const onFailure = (e: Error) => {
    invalidateCache();
    setLoading(false);
    notify.failure(
      `Deletion of key ${bucketKey.name} for storage bucket ${bucket.name} failed`,
      e,
    );
  };

  const handleDelete = () => {
    setLoading(true);
    deleteStorageBucketKey(
      bucket.name,
      bucketKey.name,
      bucket.pool,
      projectName,
    )
      .then((operation) => {
        if (hasStorageAndNetworkOperations) {
          toastNotify.info(
            <>
              Deletion of key{" "}
              <ResourceLabel bold type="bucket-key" value={bucketKey.name} />{" "}
              for storage bucket{" "}
              <ResourceLabel bold type="bucket" value={bucket.name} />
              has started.
            </>,
          );
          eventQueue.set(
            operation.metadata.id,
            () => {
              onSuccess();
            },
            (msg) => {
              onFailure(new Error(msg));
            },
          );
        } else {
          onSuccess();
        }
      })
      .catch(onFailure);
  };

  return (
    <ConfirmationButton
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete key{" "}
            <ResourceLabel type="bucket-key" value={bucketKey.name} bold />.
            <br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        confirmButtonLabel: "Delete",
        onConfirm: handleDelete,
      }}
      appearance="base"
      className="has-icon"
      shiftClickEnabled
      showShiftClickHint
      disabled={!canEditBucket(bucket)}
      onHoverText={
        canEditBucket(bucket)
          ? "Delete key"
          : "You do not have permission to delete this key."
      }
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteStorageBucketKeyBtn;
