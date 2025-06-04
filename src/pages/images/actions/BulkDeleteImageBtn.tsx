import type { FC } from "react";
import { useState } from "react";
import { deleteImageBulk } from "api/images";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useEventQueue } from "context/eventQueue";
import { getPromiseSettledCounts } from "util/promises";
import { pluralize } from "util/instanceBulkActions";
import BulkDeleteButton from "components/BulkDeleteButton";
import { useImageEntitlements } from "util/entitlements/images";
import type { LxdImage } from "types/image";
import { useToastNotification } from "@canonical/react-components";

interface Props {
  images: LxdImage[];
  project: string;
  onStart: () => void;
  onFinish: () => void;
}

const BulkDeleteImageBtn: FC<Props> = ({
  images,
  project,
  onStart,
  onFinish,
}) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { canDeleteImage } = useImageEntitlements();

  const totalCount = images.length;
  const deletableImages = images.filter((image) => canDeleteImage(image));
  const fingerprints = deletableImages.map((image) => image.fingerprint);
  const deleteCount = deletableImages.length;

  const handleDelete = () => {
    setLoading(true);
    onStart();
    deleteImageBulk(fingerprints, project, eventQueue)
      .then((results) => {
        const { fulfilledCount, rejectedCount } =
          getPromiseSettledCounts(results);
        if (fulfilledCount === deleteCount) {
          toastNotify.success(
            <>
              <b>{fingerprints.length}</b>{" "}
              {pluralize("image", fingerprints.length)} deleted.
            </>,
          );
        } else if (rejectedCount === deleteCount) {
          toastNotify.failure(
            "Image bulk deletion failed",
            undefined,
            <>
              <b>{deleteCount}</b> {pluralize("image", deleteCount)} could not
              be deleted.
            </>,
          );
        } else {
          toastNotify.failure(
            "Image bulk deletion partially failed",
            undefined,
            <>
              <b>{fulfilledCount}</b> {pluralize("image", fulfilledCount)}{" "}
              deleted.
              <br />
              <b>{rejectedCount}</b> {pluralize("image", rejectedCount)} could
              not be deleted.
            </>,
          );
        }
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKeys.images,
        });
        setLoading(false);
        onFinish();
      })
      .catch((e) => {
        setLoading(false);
        toastNotify.failure("Image bulk deletion failed", e);
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
      entities={images}
      deletableEntities={deletableImages}
      entityType="image"
      onDelete={handleDelete}
      disabledReason={
        deleteCount === 0
          ? `You do not have permission to delete the selected ${pluralize("image", deleteCount)}`
          : undefined
      }
      buttonLabel={`Delete ${pluralize("image", totalCount)}`}
      confirmationButtonProps={{
        appearance: "",
        disabled: isLoading || deleteCount === 0,
        loading: isLoading,
      }}
      bulkDeleteBreakdown={getBulkDeleteBreakdown()}
      className="u-no-margin--bottom"
    />
  );
};

export default BulkDeleteImageBtn;
