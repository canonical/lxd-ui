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
          <>
            Error stopping instance <InstanceLink instance={instance} />.
          </>,
          e
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
      iconClass="p-icon--stop-instance"
      title="Confirm stop"
      confirmationMessage={`Are you sure you want to stop instance "${instance.name}"?`}
      confirmationExtra={
        <ConfirmationForce label="Force stop" force={[isForce, setForce]} />
      }
      posButtonLabel="Stop"
      onCancel={() => setForce(false)}
      onConfirm={handleStop}
      isDense={true}
      isDisabled={instance.status === "Stopped"}
    />
  );
};

export default StopInstanceBtn;
