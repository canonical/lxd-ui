import type { FC } from "react";
import { useState } from "react";
import type { LxdStorageBucket } from "types/storage";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ConfirmationButton,
  Icon,
  useNotify,
} from "@canonical/react-components";
import { useStorageBucketEntitlements } from "util/entitlements/storage-buckets";
import { deleteStorageBucket } from "api/storage-buckets";
import { useCurrentProject } from "context/useCurrentProject";

interface Props {
  bucket: LxdStorageBucket;
  onFinish: () => void;
  appearance?: string;
  hasIcon?: boolean;
  label?: string;
  classname?: string;
}

const DeleteStorageBucketBtn: FC<Props> = ({
  bucket,
  onFinish,
  appearance = "base",
  hasIcon = true,
  label,
  classname,
}) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { canDeleteBucket } = useStorageBucketEntitlements();
  const { project } = useCurrentProject();
  const projectName = project?.name || "";

  const handleDelete = () => {
    setLoading(true);
    deleteStorageBucket(bucket.name, bucket.pool, projectName)
      .then(onFinish)
      .catch((e) => {
        notify.failure("Storage bucket deletion failed", e);
      })
      .finally(() => {
        setLoading(false);
        queryClient.invalidateQueries({
          queryKey: [queryKeys.buckets, projectName],
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
            This will permanently delete bucket <b>{bucket.name}</b>.<br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        confirmButtonLabel: "Delete",
        onConfirm: handleDelete,
      }}
      appearance={appearance}
      className={classname}
      shiftClickEnabled
      showShiftClickHint
      disabled={!canDeleteBucket(bucket)}
      onHoverText={
        canDeleteBucket(bucket)
          ? "Delete bucket"
          : "You do not have permission to delete this bucket."
      }
    >
      {hasIcon && <Icon name="delete" />}
      {label && <span>{label}</span>}
    </ConfirmationButton>
  );
};

export default DeleteStorageBucketBtn;
