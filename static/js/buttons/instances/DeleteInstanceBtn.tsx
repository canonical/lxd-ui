import React, { useState } from "react";
import { deleteInstance, LxdInstance } from "../../api/instances";

type Props = {
  instance: LxdInstance;
  onSuccess: Function;
  onFailure: Function;
};

function DeleteInstanceBtn({ instance, onSuccess, onFailure }: Props) {
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
    <button
      onClick={handleDelete}
      className="is-dense"
      disabled={isLoading || instance.status !== "Stopped"}
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
}

export default DeleteInstanceBtn;
