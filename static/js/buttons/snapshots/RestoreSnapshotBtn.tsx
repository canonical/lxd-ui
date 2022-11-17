import React, { FC, useState } from "react";
import { LxdSnapshot } from "../../types/instance";
import { restoreSnapshot } from "../../api/snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";

type Props = {
  instanceName: string;
  snapshot: LxdSnapshot;
  onSuccess: Function;
  onFailure: Function;
};

const RestoreSnapshotBtn: FC<Props> = ({
  instanceName,
  snapshot,
  onSuccess,
  onFailure,
}) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleRestore = () => {
    setLoading(true);
    restoreSnapshot(instanceName, snapshot)
      .then(() => {
        setLoading(false);
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKeys.instances,
        });
        onSuccess();
      })
      .catch(() => {
        setLoading(false);
        onFailure("Error on snapshot restore.");
      });
  };

  return (
    <button onClick={handleRestore} className="is-dense">
      <i
        className={
          isLoading ? "p-icon--spinner u-animation--spin" : "p-icon--export"
        }
      >
        Restore
      </i>
    </button>
  );
};

export default RestoreSnapshotBtn;
