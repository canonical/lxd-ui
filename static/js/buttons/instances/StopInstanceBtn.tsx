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

const StopInstanceBtn: FC<Props> = ({ instance, notify, onFinish }) => {
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
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on instance stop.", e);
      });
  };

  return (
    <Button
      appearance="base"
      className="p-contextual-menu__link"
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
