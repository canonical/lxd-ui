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
  const isDisabled = isLoading || !enabledStatuses.includes(instance.status);

  const handleStart = () => {
    instanceLoading.setLoading(instance, "Starting");
    const mutation =
      instance.status === "Frozen" ? unfreezeInstance : startInstance;
    void mutation(instance)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () =>
            toastNotify.success(
              <>
                Instance <InstanceLink instance={instance} /> started.
              </>,
            ),
          (msg) =>
            toastNotify.failure(
              "Instance start failed",
              new Error(msg),
              <>
                Instance <ItemName item={instance} bold />:
              </>,
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
        toastNotify.failure("Instance start failed", e);
        instanceLoading.setFinish(instance);
      });
  };
  return { handleStart, isLoading, isDisabled };
};
