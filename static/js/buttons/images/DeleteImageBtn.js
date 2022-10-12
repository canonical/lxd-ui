import React, { useState } from "react";
import PropTypes from "prop-types";
import { deleteImage } from "../../api/images";

function DeleteImageBtn({ image, onSuccess, onFailure }) {
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
      <i className={isLoading ? "p-icon--spinner u-animation--spin" : "p-icon--delete"}>Delete</i>
    </button>
  );
}

DeleteImageBtn.propTypes = {
  image: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func.isRequired,
};

export default DeleteImageBtn;
