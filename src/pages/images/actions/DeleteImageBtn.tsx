import React, { FC, useState } from "react";
import { deleteImage } from "api/images";
import { LxdImage } from "types/image";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ConfirmationButton,
  Icon,
  useNotify,
} from "@canonical/react-components";

interface Props {
  image: LxdImage;
}

const DeleteImageBtn: FC<Props> = ({ image }) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setLoading(true);
    deleteImage(image)
      .then(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.images],
        });
        notify.success("Image deleted.");
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Image deletion failed", e);
      });
  };

  return (
    <ConfirmationButton
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        confirmMessage: `This will permanently delete image "${image.properties.description}".\nThis action cannot be undone, and can result in data loss.`,
        confirmButtonLabel: "Delete",
        onConfirm: handleDelete,
      }}
      disabled={isLoading}
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteImageBtn;
