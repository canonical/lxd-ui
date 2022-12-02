import React, { FC, useState } from "react";
import { deleteImage } from "../../api/images";
import { LxdImage } from "../../types/image";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";
import { NotificationHelper } from "../../types/notification";
import ConfirmationButton from "../ConfirmationButton";

type Props = {
  image: LxdImage;
  notify: NotificationHelper;
};

const DeleteImageBtn: FC<Props> = ({ image, notify }) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setLoading(true);
    deleteImage(image)
      .then(() => {
        setLoading(false);
        queryClient.invalidateQueries({
          queryKey: [queryKeys.images],
        });
        notify.success("Image deleted.");
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on image delete.", e);
      });
  };

  return (
    <ConfirmationButton
      isLoading={isLoading}
      iconClass="p-icon--delete"
      title="Confirm delete"
      confirmationMessage={`Are you sure you want to delete image "${image.properties.description}"?
                            This action cannot be undone, and can result in data loss.`}
      posButtonLabel="Delete"
      onPositive={handleDelete}
      isDisabled={isLoading}
    />
  );
};

export default DeleteImageBtn;
