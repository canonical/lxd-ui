import { useQueryClient } from "@tanstack/react-query";
import { unfreezeInstance, startInstance } from "api/instances";
import { useInstanceLoading } from "context/instanceLoading";
import InstanceLink from "pages/instances/InstanceLink";
import { LxdInstance } from "types/instance";
import { queryKeys } from "./queryKeys";
import { useEventQueue } from "context/eventQueue";
import ItemName from "components/ItemName";
import { useToastNotification } from "context/toastNotificationProvider";

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
    void queryClient.invalidateQueries({
      queryKey: [queryKeys.instances],
    });
  };

  const handleStart = () => {
    instanceLoading.setLoading(instance, "Starting");
    const mutation =
      instance.status === "Frozen" ? unfreezeInstance : startInstance;
    void mutation(instance)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            toastNotify.success(
              <>
                Instance <InstanceLink instance={instance} /> started.
              </>,
            );
            clearCache();
          },
          (msg) => {
            toastNotify.failure(
              "Instance start failed",
              new Error(msg),
              <>
                Instance <ItemName item={instance} bold />:
              </>,
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
        toastNotify.failure("Instance start failed", e);
        instanceLoading.setFinish(instance);
      });
  };
  return { handleStart, isLoading, isDisabled };
};
