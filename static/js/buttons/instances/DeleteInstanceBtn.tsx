import React, { FC, useState } from "react";
import { deleteInstance } from "../../api/instances";
import { LxdInstance } from "../../types/instance";

type Props = {
  instance: LxdInstance;
  onSuccess: Function;
  onFailure: Function;
};

const DeleteInstanceBtn: FC<Props> = ({ instance, onSuccess, onFailure }) => {
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
};

export default DeleteInstanceBtn;
