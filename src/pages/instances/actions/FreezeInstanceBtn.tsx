import { FC } from "react";
import { LxdInstance } from "types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { freezeInstance } from "api/instances";
import { useInstanceLoading } from "context/instanceLoading";
import InstanceLink from "pages/instances/InstanceLink";
import ItemName from "components/ItemName";
import { ConfirmationButton, Icon } from "@canonical/react-components";
import { useEventQueue } from "context/eventQueue";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  instance: LxdInstance;
}

const FreezeInstanceBtn: FC<Props> = ({ instance }) => {
  const eventQueue = useEventQueue();
  const instanceLoading = useInstanceLoading();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const isLoading =
    instanceLoading.getType(instance) === "Freezing" ||
    instance.status === "Freezing";

  const handleFreeze = () => {
    instanceLoading.setLoading(instance, "Freezing");
    void freezeInstance(instance)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () =>
            toastNotify.success(
              <>
                Instance <InstanceLink instance={instance} /> frozen.
              </>,
            ),
          (msg) =>
            toastNotify.failure(
              "Instance freeze failed",
              new Error(msg),
              <InstanceLink instance={instance} />,
            ),
          () => {
            instanceLoading.setFinish(instance);
            void queryClient.invalidateQueries({
              queryKey: [queryKeys.instances],
            });
          },
        );
      })
      .catch((e) => {
        toastNotify.failure(
          "Instance freeze failed",
          e,
          <InstanceLink instance={instance} />,
        );
        instanceLoading.setFinish(instance);
      });
  };

  const isDisabled = isLoading || instance.status !== "Running";

  return (
    <ConfirmationButton
      appearance="base"
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm freeze",
        children: (
          <p>
            This will freeze instance <ItemName item={instance} bold />.
          </p>
        ),
        onConfirm: handleFreeze,
        confirmButtonLabel: "Freeze",
      }}
      className="has-icon is-dense"
      disabled={isDisabled}
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="pause" />
    </ConfirmationButton>
  );
};

export default FreezeInstanceBtn;
