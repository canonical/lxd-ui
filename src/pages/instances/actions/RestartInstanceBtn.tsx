import type { FC } from "react";
import { useState } from "react";
import type { LxdInstance } from "types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { restartInstance } from "api/instances";
import { useInstanceLoading } from "context/instanceLoading";
import ConfirmationCheckbox from "components/ConfirmationCheckbox";
import { Icon, useToastNotification } from "@canonical/react-components";
import { useEventQueue } from "context/eventQueue";
import { InstanceRichChip } from "../InstanceRichChip";
import { useInstanceEntitlements } from "util/entitlements/instances";
import ResourceLabel from "components/ResourceLabel";
import MountedConfirmationButton from "components/MountedConfirmationButton";

interface Props {
  instance: LxdInstance;
}

const RestartInstanceBtn: FC<Props> = ({ instance }) => {
  const eventQueue = useEventQueue();
  const instanceLoading = useInstanceLoading();
  const toastNotify = useToastNotification();
  const [isForce, setForce] = useState(false);
  const queryClient = useQueryClient();
  const isLoading =
    instanceLoading.getType(instance) === "Restarting" ||
    instance.status === "Restarting";
  const { canUpdateInstanceState } = useInstanceEntitlements();

  const instanceLink = (
    <InstanceRichChip
      instanceName={instance.name}
      projectName={instance.project}
    />
  );

  const handleRestart = () => {
    instanceLoading.setLoading(instance, "Restarting");
    restartInstance(instance, isForce)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => toastNotify.success(<>Instance {instanceLink} restarted.</>),
          (msg) =>
            toastNotify.failure(
              "Instance restart failed",
              new Error(msg),
              instanceLink,
            ),
          () => {
            instanceLoading.setFinish(instance);
            queryClient.invalidateQueries({
              queryKey: [queryKeys.instances],
            });
          },
        );
      })
      .catch((e) => {
        toastNotify.failure("Instance restart failed", e, instanceLink);
        instanceLoading.setFinish(instance);
      });
  };

  const disabledStatuses = ["Stopped", "Frozen", "Error"];
  const isDisabled =
    disabledStatuses.includes(instance.status) ||
    instanceLoading.getType(instance) === "Migrating";

  return (
    <MountedConfirmationButton
      appearance="base"
      loading={isLoading}
      className="has-icon is-dense"
      confirmationModalProps={{
        title: "Confirm restart",
        children: (
          <p>
            This will restart instance{" "}
            <ResourceLabel type="instance" value={instance.name} bold />.
          </p>
        ),
        onConfirm: handleRestart,
        close: () => {
          setForce(false);
        },
        confirmButtonLabel: canUpdateInstanceState(instance)
          ? "Restart"
          : "You do not have permission to restart this instance",
        confirmExtra: (
          <ConfirmationCheckbox
            label="Force restart"
            confirmed={[isForce, setForce]}
          />
        ),
      }}
      disabled={isDisabled || !canUpdateInstanceState(instance)}
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="restart" />
    </MountedConfirmationButton>
  );
};

export default RestartInstanceBtn;
