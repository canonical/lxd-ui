import React, { FC, useState } from "react";
import { deleteImage } from "../../api/images";
import { LxdImage } from "../../types/image";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";
import { NotificationHelper } from "../../types/notification";

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
    <button
      onClick={handleDelete}
      className="p-button is-dense"
      disabled={isLoading}
    >
      <i
        className={
          isLoading ? "p-icon--spinner u-animation--spin" : "p-icon--delete"
        }
      >
        Delete
      </i>
    </button>
  );
};

export default DeleteImageBtn;
