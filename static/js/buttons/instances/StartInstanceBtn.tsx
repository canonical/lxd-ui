import React, { FC, useState } from "react";
import { startInstance } from "../../api/instances";
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

const StartInstanceBtn: FC<Props> = ({ instance, notify, onFinish }) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleStart = () => {
    setLoading(true);
    startInstance(instance)
      .then(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
        notify.success(`Instance ${instance.name} started.`);
        onFinish?.();
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on instance start.", e);
      });
  };

  return (
    <Button
      appearance="base"
      className="p-contextual-menu__link"
      dense
      hasIcon
      onClick={handleStart}
      disabled={isLoading || instance.status !== "Stopped"}
    >
      <i
        className={
          isLoading ? "p-icon--spinner u-animation--spin" : "p-icon--video-play"
        }
      />
      <span>Start instance</span>
    </Button>
  );
};

export default StartInstanceBtn;
