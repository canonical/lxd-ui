import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { unfreezeInstance, startInstance } from "api/instances";
import ItemName from "components/ItemName";
import { useInstanceLoading } from "context/instanceLoading";
import InstanceLink from "pages/instances/InstanceLink";
import { LxdInstance } from "types/instance";
import { queryKeys } from "./queryKeys";
import { useNotify } from "@canonical/react-components";

export const useInstanceStart = (instance: LxdInstance) => {
  const instanceLoading = useInstanceLoading();
  const notify = useNotify();
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
    mutation(instance)
      .then(() => {
        notify.success(
          <>
            Instance <InstanceLink instance={instance} /> started.
          </>
        );
      })
      .catch((e) => {
        notify.failure(
          "Instance start failed",
          e,
          <>
            Instance <ItemName item={instance} bold />:
          </>
        );
      })
      .finally(() => {
        instanceLoading.setFinish(instance);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
      });
  };
  return { handleStart, isLoading, isDisabled };
};
