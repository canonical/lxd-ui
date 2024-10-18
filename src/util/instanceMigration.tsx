import { useQueryClient } from "@tanstack/react-query";
import { useEventQueue } from "context/eventQueue";
import { useInstanceLoading } from "context/instanceLoading";
import { useToastNotification } from "context/toastNotificationProvider";
import { queryKeys } from "./queryKeys";
import { migrateInstance } from "api/instances";
import { LxdInstance } from "types/instance";
import { ReactNode } from "react";
import { capitalizeFirstLetter } from "./helpers";
import ResourceLink from "components/ResourceLink";
import InstanceLinkChip from "pages/instances/InstanceLinkChip";

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

  const handleSuccess = (newTarget: string) => {
    let successMessage: ReactNode = "";
    if (type === "cluster member") {
      successMessage = (
        <>
          Instance <InstanceLinkChip instance={instance} /> successfully
          migrated to cluster member{" "}
          <ResourceLink
            type="cluster-member"
            value={newTarget}
            to="/ui/cluster"
          />
        </>
      );
    }

    if (type === "root storage pool") {
      successMessage = (
        <>
          Instance <InstanceLinkChip instance={instance} /> root storage
          successfully migrated to pool{" "}
          <ResourceLink
            type="pool"
            value={newTarget}
            to={`/ui/project/${instance.project}/storage/pool/${newTarget}`}
          />
        </>
      );
    }

    toastNotify.success(successMessage);
  };

  const notifyFailure = (e: unknown) => {
    let failureMessage = "";
    if (type === "cluster member") {
      failureMessage = `Cluster member migration failed for instance ${instance.name}`;
    }

    if (type === "root storage pool") {
      failureMessage = `Root storage migration failed for instance ${instance.name}`;
    }

    instanceLoading.setFinish(instance);
    toastNotify.failure(
      failureMessage,
      e,
      <InstanceLinkChip instance={instance} />,
    );
  };

  const handleFailure = (msg: string) => {
    notifyFailure(new Error(msg));
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
          () => handleSuccess(target),
          (err) => handleFailure(err),
          handleFinish,
        );
        toastNotify.info(
          <>
            {capitalizeFirstLetter(type)} migration started for{" "}
            <InstanceLinkChip instance={instance} />.
          </>,
        );
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.instances, instance.name, instance.project],
        });
        onSuccess();
      })
      .catch((e) => {
        notifyFailure(e);
      });
  };

  return {
    handleMigrate,
  };
};
