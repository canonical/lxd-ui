import React, { FC, useState } from "react";
import { deleteImage } from "api/images";
import { LxdImage } from "types/image";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import ConfirmationButton from "components/ConfirmationButton";
import { useNotify } from "context/notify";

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
      isLoading={isLoading}
      icon="delete"
      title="Confirm delete"
      confirmationMessage={`Are you sure you want to delete image "${image.properties.description}"?\nThis action cannot be undone, and can result in data loss.`}
      confirmButtonLabel="Delete"
      onConfirm={handleDelete}
      isDisabled={isLoading}
    />
  );
};

export default DeleteImageBtn;
