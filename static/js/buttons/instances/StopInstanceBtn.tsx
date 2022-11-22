import React, { FC, useState } from "react";
import { stopInstance } from "../../api/instances";
import { LxdInstance } from "../../types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";
import { NotificationHelper } from "../../types/notification";

type Props = {
  instance: LxdInstance;
  notify: NotificationHelper;
};

const StopInstanceBtn: FC<Props> = ({ instance, notify }) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleStop = () => {
    setLoading(true);
    stopInstance(instance)
      .then(() => {
        setLoading(false);
        queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
        notify.success(`Instance ${instance.name} stopped.`);
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on instance stop.", e);
      });
  };

  return (
    <button
      onClick={handleStop}
      className="is-dense"
      disabled={isLoading || instance.status !== "Running"}
    >
      <i
        className={
          isLoading ? "p-icon--spinner u-animation--spin" : "p-icon--power-off"
        }
      >
        Stop
      </i>
    </button>
  );
};

export default StopInstanceBtn;
