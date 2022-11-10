import React, { FC, useState } from "react";
import { LxdInstance, LxdSnapshot } from "../../types/instance";
import { deleteSnapshot } from "../../api/snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";

type Props = {
  instance: LxdInstance;
  snapshot: LxdSnapshot;
  onSuccess: Function;
  onFailure: Function;
};

const DeleteSnapshotBtn: FC<Props> = ({
  instance,
  snapshot,
  onSuccess,
  onFailure,
}) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setLoading(true);
    deleteSnapshot(instance, snapshot)
      .then(() => {
        setLoading(false);
        queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
        onSuccess();
      })
      .catch(() => {
        setLoading(false);
        onFailure("Error on snapshot delete.");
      });
  };

  return (
    <button onClick={handleDelete} className="is-dense">
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

export default DeleteSnapshotBtn;
