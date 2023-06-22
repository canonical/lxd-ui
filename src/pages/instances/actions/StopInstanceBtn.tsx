import React, { FC, useState } from "react";
import { LxdInstance } from "types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { stopInstance } from "api/instances";
import { queryKeys } from "util/queryKeys";
import ConfirmationButton from "components/ConfirmationButton";
import { useNotify } from "context/notify";
import { useInstanceLoading } from "context/instanceLoading";
import InstanceLink from "pages/instances/InstanceLink";
import ConfirmationForce from "components/ConfirmationForce";
import ItemName from "components/ItemName";

interface Props {
  instance: LxdInstance;
}

const StopInstanceBtn: FC<Props> = ({ instance }) => {
  const instanceLoading = useInstanceLoading();
  const notify = useNotify();
  const [isForce, setForce] = useState(false);
  const queryClient = useQueryClient();
  const isLoading =
    instanceLoading.getType(instance) === "Stopping" ||
    instance.status === "Stopping";

  const handleStop = () => {
    instanceLoading.setLoading(instance, "Stopping");
    stopInstance(instance, isForce)
      .then(() => {
        notify.success(
          <>
            Instance <InstanceLink instance={instance} /> stopped.
          </>
        );
      })
      .catch((e) => {
        notify.failure(
          "Instance stop failed",
          e,
          <>
            Instance <ItemName item={instance} bold />:
          </>
        );
      })
      .finally(() => {
        instanceLoading.setFinish(instance);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
      });
  };

  return (
    <ConfirmationButton
      toggleAppearance="base"
      isLoading={isLoading}
      icon="stop"
      title="Confirm stop"
      confirmMessage={
        <>
          This will stop instance <ItemName item={instance} bold />.
        </>
      }
      confirmExtra={
        <ConfirmationForce label="Force stop" force={[isForce, setForce]} />
      }
      confirmButtonLabel="Stop"
      onCancel={() => setForce(false)}
      onConfirm={handleStop}
      isDense={true}
      isDisabled={instance.status === "Stopped"}
    />
  );
};

export default StopInstanceBtn;
