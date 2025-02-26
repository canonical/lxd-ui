import { useQueryClient } from "@tanstack/react-query";
import { useEventQueue } from "context/eventQueue";
import { useInstanceLoading } from "context/instanceLoading";
import { useToastNotification } from "context/toastNotificationProvider";
import { queryKeys } from "./queryKeys";
import { migrateInstance } from "api/instances";
import type { LxdInstance } from "types/instance";
import type { ReactNode } from "react";
import { capitalizeFirstLetter } from "./helpers";
import ResourceLink from "components/ResourceLink";
import InstanceLinkChip from "pages/instances/InstanceLinkChip";
import { useNavigate } from "react-router-dom";

export type MigrationType =
  | "cluster member"
  | "root storage pool"
  | "project"
  | "";

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
  const navigate = useNavigate();

  const handleSuccess = () => {
    let successMessage: ReactNode = "";
    if (type === "cluster member") {
      successMessage = (
        <>
          Instance <InstanceLinkChip instance={instance} /> successfully
          migrated to cluster member{" "}
          <ResourceLink type="cluster-member" value={target} to="/ui/cluster" />
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
            value={target}
            to={`/ui/project/${instance.project}/storage/pool/${target}`}
          />
        </>
      );
    }

    if (type === "project") {
      successMessage = (
        <>
          Instance{" "}
          <InstanceLinkChip instance={{ ...instance, project: target }} />
          successfully migrated to project{" "}
          <ResourceLink
            type="project"
            value={target}
            to={`/ui/project/${target}`}
          />
        </>
      );

      const oldUrl = window.location.pathname;
      const newUrl = oldUrl.replace(
        `/project/${instance.project}/instance/${instance.name}`,
        `/project/${target}/instance/${instance.name}`,
      );
      if (oldUrl !== newUrl) {
        navigate(newUrl);
      }
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

    if (type === "project") {
      failureMessage = `Project migration failed for instance ${instance.name}`;
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
    queryClient.invalidateQueries({
      queryKey: [queryKeys.instances, instance.name],
    });
    instanceLoading.setFinish(instance);
  };

  const handleMigrate = () => {
    instanceLoading.setLoading(instance, "Migrating");
    const targetMember = type === "cluster member" ? target : undefined;
    const targetPool = type === "root storage pool" ? target : undefined;
    const targetProject = type === "project" ? target : undefined;
    migrateInstance(
      instance.name,
      instance.project,
      targetMember,
      targetPool,
      targetProject,
    )
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          handleSuccess,
          (err) => handleFailure(err),
          handleFinish,
        );
        toastNotify.info(
          <>
            {capitalizeFirstLetter(type)} migration started for{" "}
            <InstanceLinkChip instance={instance} />.
          </>,
        );
        queryClient.invalidateQueries({
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
