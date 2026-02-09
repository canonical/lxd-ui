import type { FC } from "react";
import { useEffect, useRef } from "react";
import { useState } from "react";
import type { LxdInstance } from "types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { stopInstance } from "api/instances";
import { queryKeys } from "util/queryKeys";
import { useInstanceLoading } from "context/instanceLoading";
import ConfirmationCheckbox from "components/ConfirmationCheckbox";
import { Icon, useToastNotification } from "@canonical/react-components";
import { useEventQueue } from "context/eventQueue";
import { useInstanceEntitlements } from "util/entitlements/instances";
import ResourceLabel from "components/ResourceLabel";
import MountedConfirmationButton from "components/MountedConfirmationButton";
import { InstanceRichChip } from "../InstanceRichChip";

interface Props {
  instance: LxdInstance;
}

const StopInstanceBtn: FC<Props> = ({ instance }) => {
  const eventQueue = useEventQueue();
  const instanceLoading = useInstanceLoading();
  const toastNotify = useToastNotification();
  const [isForce, setForce] = useState(false);
  const queryClient = useQueryClient();
  const { canUpdateInstanceState } = useInstanceEntitlements();
  const isForceRef = useRef(isForce);

  // The MountedConfirmationButton saves a reference to the handleStop callback when the modal is opened,
  // so we need to use a ref to ensure we have the latest value of isForce when the user confirms the action.
  useEffect(() => {
    isForceRef.current = isForce;
  }, [isForce]);

  const clearCache = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.instances],
    });
  };

  const isLoading =
    instanceLoading.getType(instance) === "Stopping" ||
    instance.status === "Stopping";

  const instanceLink = (
    <InstanceRichChip
      instanceName={instance.name}
      projectName={instance.project}
    />
  );

  const handleStop = () => {
    instanceLoading.setLoading(instance, "Stopping");
    stopInstance(instance, isForceRef.current)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            toastNotify.success(<>Instance {instanceLink} stopped.</>);
            clearCache();
          },
          (msg) => {
            toastNotify.failure(
              "Instance stop failed",
              new Error(msg),
              instanceLink,
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
        toastNotify.failure("Instance stop failed", e, instanceLink);
        instanceLoading.setFinish(instance);
      });
  };

  const disabledStatuses = ["Stopped", "Migrating"];

  // Keep button disabled while instance is stopping to allow force stop
  const isDisabled =
    disabledStatuses.includes(instance.status) ||
    instanceLoading.getType(instance) === "Migrating" ||
    !canUpdateInstanceState(instance);

  return (
    <MountedConfirmationButton
      appearance="base"
      loading={isLoading}
      disabled={isDisabled}
      confirmationModalProps={{
        title: "Confirm stop",
        children: (
          <p>
            This will stop instance{" "}
            <ResourceLabel type={instance.type} value={instance.name} bold />.
          </p>
        ),
        confirmExtra: (
          <ConfirmationCheckbox
            label="Force stop"
            confirmed={[isForce, setForce]}
          />
        ),
        onConfirm: handleStop,
        close: () => {
          setForce(false);
        },
        confirmButtonLabel: canUpdateInstanceState(instance)
          ? "Stop"
          : "You do not have permission to stop this instance",
      }}
      className="has-icon is-dense"
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="stop" />
    </MountedConfirmationButton>
  );
};

export default StopInstanceBtn;
