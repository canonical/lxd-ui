import type { FC } from "react";
import { useState } from "react";
import type { LxdStorageBucket, LxdStorageBucketKey } from "types/storage";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ConfirmationButton,
  Icon,
  useNotify,
} from "@canonical/react-components";
import { useStorageBucketEntitlements } from "util/entitlements/storage-buckets";
import { deleteStorageBucketKey } from "api/storage-buckets";
import { useCurrentProject } from "context/useCurrentProject";

interface Props {
  bucket: LxdStorageBucket;
  bucketKey: LxdStorageBucketKey;
  onFinish: () => void;
  hasIcon?: boolean;
  classname?: string;
  isDetailPage?: boolean;
}

const DeleteStorageBucketKeyBtn: FC<Props> = ({
  bucket,
  bucketKey,
  onFinish,
  hasIcon = true,
  classname,
  isDetailPage,
}) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { canEditBucket } = useStorageBucketEntitlements();
  const { project } = useCurrentProject();
  const projectName = project?.name || "";

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
          queryKey: [queryKeys.buckets, project, queryKeys.bucketKeys],
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
      appearance={isDetailPage ? "default" : "base"}
      className={classname}
      shiftClickEnabled
      showShiftClickHint
      disabled={!canEditBucket(bucket)}
      onHoverText={
        canEditBucket(bucket)
          ? "Delete key"
          : "You do not have permission to delete this key."
      }
    >
      {hasIcon && <Icon name="delete" />}
      {isDetailPage && <span>Delete</span>}
    </ConfirmationButton>
  );
};

export default DeleteStorageBucketKeyBtn;
