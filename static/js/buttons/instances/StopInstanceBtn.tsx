import React, { FC, useState } from "react";
import { stopInstance } from "../../api/instances";
import { LxdInstance } from "../../types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";
import { NotificationHelper } from "../../types/notification";
import { Button } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
  notify: NotificationHelper;
  onFinish?: () => void;
}

const StopInstanceBtn: FC<Props> = ({ instance, notify }) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleStop = () => {
    setLoading(true);
    stopInstance(instance)
      .then(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
        notify.success(`Instance ${instance.name} stopped.`);
        onFinish?.();
        window.dispatchEvent(new Event("resize"));
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on instance stop.", e);
        window.dispatchEvent(new Event("resize"));
      });
  };

  return (
    <Button
      appearance="base"
      dense
      hasIcon
      onClick={handleStop}
      disabled={isLoading || instance.status !== "Running"}
    >
      <i
        className={
          isLoading ? "p-icon--spinner u-animation--spin" : "p-icon--power-off"
        }
      />
      <span>Stop instance</span>
    </Button>
  );
};

export default StopInstanceBtn;
