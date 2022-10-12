import React, { useState } from "react";
import { deleteInstance } from "../../api/instances";
import PropTypes from "prop-types";

function DeleteInstanceBtn({ instance, onSuccess, onFailure }) {
  const [isLoading, setLoading] = useState(false);

  const handleDelete = () => {
    setLoading(true);
    deleteInstance(instance)
      .then(() => {
        setLoading(false);
        onSuccess();
      })
      .catch(() => {
        setLoading(false);
        onFailure("Error on instance delete.");
      });
  };

  return (
    <button onClick={handleDelete} className="is-dense" disabled={isLoading || instance.status !== "Stopped"}>
      <i className={isLoading ? "p-icon--spinner u-animation--spin" : "p-icon--delete"}>Delete</i>
    </button>
  );
}

DeleteInstanceBtn.propTypes = {
  instance: PropTypes.shape({
    status: PropTypes.string.isRequired,
  }).isRequired,
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func.isRequired,
};

export default DeleteInstanceBtn;
