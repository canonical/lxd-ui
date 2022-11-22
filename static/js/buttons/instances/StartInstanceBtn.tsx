import React, { FC, useState } from "react";
import { startInstance } from "../../api/instances";
import { LxdInstance } from "../../types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";
import { NotificationHelper } from "../../types/notification";

type Props = {
  instance: LxdInstance;
  notify: NotificationHelper;
};

const StartInstanceBtn: FC<Props> = ({ instance, notify }) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleStart = () => {
    setLoading(true);
    startInstance(instance)
      .then(() => {
        setLoading(false);
        queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
        notify.success(`Instance ${instance.name} started.`);
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on instance start.", e);
      });
  };

  return (
    <button
      onClick={handleStart}
      className="is-dense"
      disabled={isLoading || instance.status !== "Stopped"}
    >
      <i
        className={
          isLoading ? "p-icon--spinner u-animation--spin" : "p-icon--video-play"
        }
      >
        Start
      </i>
    </button>
  );
};

export default StartInstanceBtn;
