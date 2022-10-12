import React, { useState } from "react";
import { deleteImage, LxdImage } from "../../api/images";

type Props = {
  image: LxdImage;
  onSuccess: Function;
  onFailure: Function;
};

function DeleteImageBtn({ image, onSuccess, onFailure }: Props) {
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
}

export default DeleteImageBtn;
