import type { FC } from "react";
import { useState } from "react";
import type { LxdStorageBucket } from "types/storage";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useStorageBucketEntitlements } from "util/entitlements/storage-buckets";
import { deleteStorageBucket } from "api/storage-buckets";
import { useEventQueue } from "context/eventQueue";
import { useCurrentProject } from "context/useCurrentProject";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import ResourceLabel from "components/ResourceLabel";
import { useNavigate } from "react-router-dom";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  bucket: LxdStorageBucket;
  classname?: string;
  isDetailPage?: boolean;
}

const DeleteStorageBucketBtn: FC<Props> = ({
  bucket,
  classname,
  isDetailPage,
}) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { canDeleteBucket } = useStorageBucketEntitlements();
  const { project } = useCurrentProject();
  const projectName = project?.name || "";
  const navigate = useNavigate();
  const toastNotify = useToastNotification();
  const { hasStorageAndNetworkOperations } = useSupportedFeatures();
  const eventQueue = useEventQueue();

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.storage, projectName, queryKeys.buckets],
    });
  };

  const onSuccess = () => {
    invalidateCache();

    // Only navigate to the storage buckets list if we are still on the deleted storage bucket's detail page
    const storageBucketDetailPath = `${ROOT_PATH}/ui/project/${encodeURIComponent(project?.name || "")}/storage/pool/${encodeURIComponent(bucket.pool)}/bucket/${encodeURIComponent(bucket.name)}`;
    if (location.pathname.startsWith(storageBucketDetailPath)) {
      navigate(
        `${ROOT_PATH}/ui/project/${encodeURIComponent(project?.name || "")}/storage/buckets`,
      );
    }

    toastNotify.success(
      <>
        Storage bucket <ResourceLabel bold type="bucket" value={bucket.name} />{" "}
        deleted.
      </>,
    );
  };

  const onFailure = (e: unknown) => {
    invalidateCache();
    setLoading(false);
    notify.failure("Storage bucket deletion failed", e);
  };

  const handleDelete = () => {
    setLoading(true);
    deleteStorageBucket(bucket.name, bucket.pool, projectName)
      .then((operation) => {
        if (hasStorageAndNetworkOperations) {
          toastNotify.info(
            <>
              Deletion of storage bucket{" "}
              <ResourceLabel bold type="bucket" value={bucket.name} /> has
              started.
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
      .catch((e) => {
        onFailure(e);
      });
  };

  return (
    <ConfirmationButton
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete bucket{" "}
            <ResourceLabel type="bucket" value={bucket.name} bold />.<br />
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
      disabled={!canDeleteBucket(bucket)}
      onHoverText={
        canDeleteBucket(bucket)
          ? "Delete bucket"
          : "You do not have permission to delete this bucket."
      }
    >
      <Icon name="delete" />
      {isDetailPage && <span>Delete</span>}
    </ConfirmationButton>
  );
};

export default DeleteStorageBucketBtn;
