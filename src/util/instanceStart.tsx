import { useQueryClient } from "@tanstack/react-query";
import { unfreezeInstance, startInstance } from "api/instances";
import { useInstanceLoading } from "context/instanceLoading";
import type { LxdInstance } from "types/instance";
import { queryKeys } from "./queryKeys";
import { useEventQueue } from "context/eventQueue";
import { useToastNotification } from "@canonical/react-components";
import { InstanceRichChip } from "pages/instances/InstanceRichChip";

export const useInstanceStart = (instance: LxdInstance) => {
  const eventQueue = useEventQueue();
  const instanceLoading = useInstanceLoading();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();

  const isLoading =
    instanceLoading.getType(instance) === "Starting" ||
    instance.status === "Starting";

  const enabledStatuses = ["Stopped", "Frozen"];
  const isDisabled =
    isLoading ||
    !enabledStatuses.includes(instance.status) ||
    instanceLoading.getType(instance) === "Migrating";

  const clearCache = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.instances],
    });
  };

  const handleStart = () => {
    instanceLoading.setLoading(instance, "Starting");
    const mutation =
      instance.status === "Frozen" ? unfreezeInstance : startInstance;

    const instanceLink = (
      <InstanceRichChip
        instanceName={instance.name}
        projectName={instance.project}
      />
    );
    mutation(instance)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            toastNotify.success(<>Instance {instanceLink} started.</>);
            clearCache();
          },
          (msg) => {
            toastNotify.failure(
              "Instance start failed",
              new Error(msg),
              instanceLink,
            );
            // Delay clearing the cache, because the instance is reported as RUNNING
            // when a start operation failed, only shortly after it goes back to STOPPED
            // and we want to avoid showing the intermediate RUNNING state.
            setTimeout(clearCache, 1500);
          },
          () => {
            instanceLoading.setFinish(instance);
          },
        );
      })
      .catch((e) => {
        toastNotify.failure("Instance start failed", e, instanceLink);
        instanceLoading.setFinish(instance);
      });
  };
  return { handleStart, isLoading, isDisabled };
};
