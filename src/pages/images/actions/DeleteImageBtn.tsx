import { FC, useState } from "react";
import { deleteImage } from "api/images";
import { LxdImage } from "types/image";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { ConfirmationButton, Icon } from "@canonical/react-components";
import { useEventQueue } from "context/eventQueue";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  image: LxdImage;
  project: string;
}

const DeleteImageBtn: FC<Props> = ({ image, project }) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const description = image.properties?.description ?? image.fingerprint;

  const handleDelete = () => {
    setLoading(true);
    void deleteImage(image, project)
      .then((operation) =>
        eventQueue.set(
          operation.metadata.id,
          () => {
            void queryClient.invalidateQueries({
              queryKey: [queryKeys.images],
            });
            void queryClient.invalidateQueries({
              queryKey: [queryKeys.projects, project],
            });
            toastNotify.success(`Image ${description} deleted.`);
          },
          (msg) =>
            toastNotify.failure(
              `Image ${description} deletion failed`,
              new Error(msg),
            ),
          () => setLoading(false),
        ),
      )
      .catch((e) => {
        toastNotify.failure(`Image ${description} deletion failed`, e);
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
        confirmButtonLabel: "Delete",
        onConfirm: handleDelete,
      }}
      className="has-icon"
      appearance="base"
      disabled={isLoading}
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteImageBtn;
