import { useQueryClient } from "@tanstack/react-query";
import { useEventQueue } from "context/eventQueue";
import { useInstanceLoading } from "context/instanceLoading";
import { useToastNotification } from "context/toastNotificationProvider";
import { queryKeys } from "./queryKeys";
import ItemName from "components/ItemName";
import { migrateInstance } from "api/instances";
import { LxdInstance } from "types/instance";
import { ReactNode } from "react";
import { capitalizeFirstLetter } from "./helpers";

export type MigrationType = "cluster member" | "root storage pool" | "";

type Props = {
  instance: LxdInstance;
  type: MigrationType;
  target: string;
  onSuccess: () => void;
};

export const useInstanceMigration = ({
  instance,
  onSuccess,
  type,
  target,
}: Props) => {
  const toastNotify = useToastNotification();
  const instanceLoading = useInstanceLoading();
  const eventQueue = useEventQueue();
  const queryClient = useQueryClient();

  const handleSuccess = (newTarget: string, instanceName: string) => {
    let successMessage: ReactNode = "";
    if (type === "cluster member") {
      successMessage = (
        <>
          Instance <ItemName item={{ name: instanceName }} bold /> successfully
          migrated to cluster member{" "}
          <ItemName item={{ name: newTarget }} bold />
        </>
      );
    }

    if (type === "root storage pool") {
      successMessage = (
        <>
          Instance <ItemName item={{ name: instanceName }} bold /> root storage
          successfully migrated to pool{" "}
          <ItemName item={{ name: newTarget }} bold />
        </>
      );
    }

    toastNotify.success(successMessage);
  };

  const notifyFailure = (e: unknown, instanceName: string) => {
    let failureMessage = "";
    if (type === "cluster member") {
      failureMessage = `Cluster member migration failed for instance ${instanceName}`;
    }

    if (type === "root storage pool") {
      failureMessage = `Root storage migration failed for instance ${instanceName}`;
    }

    instanceLoading.setFinish(instance);
    toastNotify.failure(failureMessage, e);
  };

  const handleFailure = (msg: string, instanceName: string) => {
    notifyFailure(new Error(msg), instanceName);
  };

  const handleFinish = () => {
    void queryClient.invalidateQueries({
      queryKey: [queryKeys.instances, instance.name],
    });
    instanceLoading.setFinish(instance);
  };

  const handleMigrate = () => {
    instanceLoading.setLoading(instance, "Migrating");
    const targetMember = type === "cluster member" ? target : undefined;
    const targetPool = type === "root storage pool" ? target : undefined;
    migrateInstance(instance.name, instance.project, targetMember, targetPool)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => handleSuccess(target, instance.name),
          (err) => handleFailure(err, instance.name),
          handleFinish,
        );
        toastNotify.info(
          `${capitalizeFirstLetter(type)} migration started for instance ${instance.name}`,
        );
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances, instance.name, instance.project],
        });
        onSuccess();
      })
      .catch((e) => {
        notifyFailure(e, instance.name);
      });
  };

  return {
    handleMigrate,
  };
};
