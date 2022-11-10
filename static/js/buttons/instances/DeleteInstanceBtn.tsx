import React, { FC, useState } from "react";
import { deleteInstance } from "../../api/instances";
import { LxdInstance } from "../../types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";

type Props = {
  instance: LxdInstance;
  onFailure: Function;
};

const DeleteInstanceBtn: FC<Props> = ({ instance, onFailure }) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setLoading(true);
    deleteInstance(instance)
      .then(() => {
        setLoading(false);
        queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
      })
      .catch((e) => {
        setLoading(false);
        onFailure(`Error on instance delete. ${e.toString()}`);
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
