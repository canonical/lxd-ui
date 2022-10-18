import React, { FC, useState } from "react";
import { deleteImage } from "../../api/images";
import { LxdImage } from "../../types/image";

type Props = {
  image: LxdImage;
  onSuccess: Function;
  onFailure: Function;
};

const DeleteImageBtn: FC<Props> = ({ image, onSuccess, onFailure }) => {
  const [isLoading, setLoading] = useState(false);

  const handleDelete = () => {
    setLoading(true);
    deleteImage(image)
      .then(() => {
        setLoading(false);
        onSuccess();
      })
      .catch(() => {
        setLoading(false);
        onFailure("Error on image delete.");
      });
  };

  return (
    <button onClick={handleDelete} className="is-dense" disabled={isLoading}>
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
