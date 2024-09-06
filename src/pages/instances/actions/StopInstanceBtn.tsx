import { FC, useState } from "react";
import { LxdInstance } from "types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { stopInstance } from "api/instances";
import { queryKeys } from "util/queryKeys";
import { useInstanceLoading } from "context/instanceLoading";
import InstanceLink from "pages/instances/InstanceLink";
import ConfirmationForce from "components/ConfirmationForce";
import ItemName from "components/ItemName";
import { ConfirmationButton, Icon } from "@canonical/react-components";
import { useEventQueue } from "context/eventQueue";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  instance: LxdInstance;
}

const StopInstanceBtn: FC<Props> = ({ instance }) => {
  const eventQueue = useEventQueue();
  const instanceLoading = useInstanceLoading();
  const toastNotify = useToastNotification();
  const [isForce, setForce] = useState(false);
  const queryClient = useQueryClient();

  const clearCache = () => {
    void queryClient.invalidateQueries({
      queryKey: [queryKeys.instances],
    });
  };

  const isLoading =
    instanceLoading.getType(instance) === "Stopping" ||
    instance.status === "Stopping";

  const handleStop = () => {
    instanceLoading.setLoading(instance, "Stopping");
    void stopInstance(instance, isForce)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            toastNotify.success(
              <>
                Instance <InstanceLink instance={instance} /> stopped.
              </>,
            );
            clearCache();
          },
          (msg) => {
            toastNotify.failure(
              "Instance stop failed",
              new Error(msg),
              <InstanceLink instance={instance} />,
            );
            // Delay clearing the cache, because the instance is reported as STOPPED
            // when a stop operation failed, only shortly after it goes back to RUNNING
            // and we want to avoid showing the intermediate STOPPED state.
            setTimeout(clearCache, 1500);
          },
          () => {
            instanceLoading.setFinish(instance);
          },
        );
      })
      .catch((e) => {
        toastNotify.failure(
          "Instance stop failed",
          e,
          <InstanceLink instance={instance} />,
        );
        instanceLoading.setFinish(instance);
      });
  };

  const disabledStatuses = ["Stopped", "Migrating"];
  const isDisabled =
    isLoading ||
    disabledStatuses.includes(instance.status) ||
    instanceLoading.getType(instance) === "Migrating";

  return (
    <ConfirmationButton
      appearance="base"
      loading={isLoading}
      disabled={isDisabled}
      confirmationModalProps={{
        title: "Confirm stop",
        children: (
          <p>
            This will stop instance <ItemName item={instance} bold />.
          </p>
        ),
        confirmExtra: (
          <ConfirmationForce label="Force stop" force={[isForce, setForce]} />
        ),
        onConfirm: handleStop,
        close: () => setForce(false),
        confirmButtonLabel: "Stop",
      }}
      className="has-icon is-dense"
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="stop" />
    </ConfirmationButton>
  );
};

export default StopInstanceBtn;
