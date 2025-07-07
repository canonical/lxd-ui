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
import { useCurrentProject } from "context/useCurrentProject";
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

  const onFinish = () => {
    toastNotify.success(
      <>
        Bucket key{" "}
        <ResourceLabel bold type="bucket-key" value={bucketKey.name} /> deleted
        for bucket <ResourceLabel bold type="bucket" value={bucket.name} />.
      </>,
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
      .then(onFinish)
      .catch((e) => {
        notify.failure("Bucket key deletion failed", e);
      })
      .finally(() => {
        setLoading(false);
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
      });
  };

  return (
    <ConfirmationButton
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete key <b>{bucketKey.name}</b>.<br />
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
