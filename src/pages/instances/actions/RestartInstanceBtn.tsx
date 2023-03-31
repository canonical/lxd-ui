import React, { FC, useState } from "react";
import { LxdInstance } from "types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import ConfirmationButton from "components/ConfirmationButton";
import { restartInstance } from "api/instances";
import { useNotify } from "context/notify";
import { useInstanceLoading } from "context/instanceLoading";
import InstanceLink from "pages/instances/InstanceLink";
import ConfirmationForce from "components/ConfirmationForce";
import ItemName from "components/ItemName";

interface Props {
  instance: LxdInstance;
}

const RestartInstanceBtn: FC<Props> = ({ instance }) => {
  const instanceLoading = useInstanceLoading();
  const notify = useNotify();
  const [isForce, setForce] = useState(false);
  const queryClient = useQueryClient();
  const isLoading =
    instanceLoading.getType(instance) === "Restarting" ||
    instance.status === "Restarting";

  const handleRestart = () => {
    instanceLoading.setLoading(instance, "Restarting");
    restartInstance(instance, isForce)
      .then(() => {
        notify.success(
          <>
            Instance <InstanceLink instance={instance} /> restarted.
          </>
        );
      })
      .catch((e) => {
        notify.failure(
          <>
            Error restarting instance <InstanceLink instance={instance} />.
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

  const disabledStatuses = ["Stopped", "Frozen", "Error"];
  const isDisabled = isLoading || disabledStatuses.includes(instance.status);

  return (
    <ConfirmationButton
      toggleAppearance="base"
      isLoading={isLoading}
      icon="restart"
      title="Confirm restart"
      confirmationMessage={
        <>
          Are you sure you want to restart instance{" "}
          <ItemName item={instance} bold />?
        </>
      }
      confirmationExtra={
        <ConfirmationForce label="Force restart" force={[isForce, setForce]} />
      }
      posButtonLabel="Restart"
      onCancel={() => setForce(false)}
      onConfirm={handleRestart}
      isDense={true}
      isDisabled={isDisabled}
    />
  );
};

export default RestartInstanceBtn;
