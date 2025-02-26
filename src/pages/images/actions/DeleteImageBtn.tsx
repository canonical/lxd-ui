import { FC, useState } from "react";
import { deleteImage } from "api/images";
import type { LxdImage } from "types/image";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { ConfirmationButton, Icon } from "@canonical/react-components";
import { useEventQueue } from "context/eventQueue";
import { useToastNotification } from "context/toastNotificationProvider";
import ResourceLabel from "components/ResourceLabel";
import { useImageEntitlements } from "util/entitlements/images";

interface Props {
  image: LxdImage;
  project: string;
}

const DeleteImageBtn: FC<Props> = ({ image, project }) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { canDeleteImage } = useImageEntitlements();

  const description = image.properties?.description ?? image.fingerprint;

  const handleDelete = () => {
    setLoading(true);
    const imageLabel = <ResourceLabel bold type="image" value={description} />;
    deleteImage(image, project)
      .then((operation) =>
        eventQueue.set(
          operation.metadata.id,
          () => {
            queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[0] === queryKeys.images,
            });
            queryClient.invalidateQueries({
              queryKey: [queryKeys.projects, project],
            });
            toastNotify.success(<>Image {imageLabel} deleted.</>);
          },
          (msg) =>
            toastNotify.failure(
              `Image ${description} deletion failed`,
              new Error(msg),
              imageLabel,
            ),
          () => setLoading(false),
        ),
      )
      .catch((e) => {
        toastNotify.failure(
          `Image ${description} deletion failed`,
          e,
          imageLabel,
        );
        setLoading(false);
      });
  };

  return (
    <ConfirmationButton
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete image <b>{description}</b>.<br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        confirmButtonLabel: canDeleteImage(image)
          ? "Delete"
          : "You do not have permission to delete this image",
        onConfirm: handleDelete,
      }}
      className="has-icon"
      appearance="base"
      disabled={isLoading || !canDeleteImage(image)}
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteImageBtn;
