import { FC } from "react";
import type { LxdInstance } from "types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { freezeInstance } from "api/instances";
import { useInstanceLoading } from "context/instanceLoading";
import { ConfirmationButton, Icon } from "@canonical/react-components";
import { useEventQueue } from "context/eventQueue";
import { useToastNotification } from "context/toastNotificationProvider";
import ItemName from "components/ItemName";
import InstanceLinkChip from "../InstanceLinkChip";
import { useInstanceEntitlements } from "util/entitlements/instances";

interface Props {
  instance: LxdInstance;
}

const FreezeInstanceBtn: FC<Props> = ({ instance }) => {
  const eventQueue = useEventQueue();
  const instanceLoading = useInstanceLoading();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { canUpdateInstanceState } = useInstanceEntitlements();

  const clearCache = () => {
    void queryClient.invalidateQueries({
      queryKey: [queryKeys.instances],
    });
  };

  const isLoading =
    instanceLoading.getType(instance) === "Freezing" ||
    instance.status === "Freezing";

  const instanceLink = <InstanceLinkChip instance={instance} />;

  const handleFreeze = () => {
    instanceLoading.setLoading(instance, "Freezing");
    freezeInstance(instance)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            toastNotify.success(<>Instance {instanceLink} frozen.</>);
            clearCache();
          },
          (msg) => {
            toastNotify.failure(
              "Instance freeze failed",
              new Error(msg),
              instanceLink,
            );
            // Delay clearing the cache, because the instance is reported as FROZEN
            // when a freeze operation failed, only shortly after it goes back to RUNNING
            // and we want to avoid showing the intermediate FROZEN state.
            setTimeout(clearCache, 1500);
          },
          () => {
            instanceLoading.setFinish(instance);
          },
        );
      })
      .catch((e) => {
        toastNotify.failure("Instance freeze failed", e, instanceLink);
        instanceLoading.setFinish(instance);
      });
  };

  const isDisabled =
    isLoading ||
    instance.status !== "Running" ||
    instanceLoading.getType(instance) === "Migrating";

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
        confirmButtonLabel: canUpdateInstanceState(instance)
          ? "Freeze"
          : "You do not have permission to freeze this instance",
      }}
      className="has-icon is-dense"
      disabled={isDisabled || !canUpdateInstanceState(instance)}
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="pause" />
    </ConfirmationButton>
  );
};

export default FreezeInstanceBtn;
