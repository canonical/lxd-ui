import { useQueryClient } from "@tanstack/react-query";
import { useEventQueue } from "context/eventQueue";
import { useInstanceLoading } from "context/instanceLoading";
import { queryKeys } from "./queryKeys";
import { migrateInstance } from "api/instances";
import type { LxdInstance } from "types/instance";
import type { ReactNode } from "react";
import { capitalizeFirstLetter } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";
import { InstanceRichChip } from "pages/instances/InstanceRichChip";
import { useNavigate } from "react-router-dom";
import { useToastNotification } from "@canonical/react-components";
import ClusterMemberRichChip from "pages/cluster/ClusterMemberRichChip";
import ProjectRichChip from "pages/projects/ProjectRichChip";
import StoragePoolRichChip from "pages/storage/StoragePoolRichChip";

export type MigrationType =
  | "cluster member"
  | "root storage pool"
  | "project"
  | "";

interface Props {
  instance: LxdInstance;
  type: MigrationType;
  target: string;
  close: () => void;
}

export const useInstanceMigration = ({
  instance,
  close,
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
          Instance{" "}
          <InstanceRichChip
            instanceName={instance.name}
            projectName={instance.project}
          />{" "}
          successfully migrated to cluster member{" "}
          <ClusterMemberRichChip clusterMember={target} />
        </>
      );
    }

    if (type === "root storage pool") {
      successMessage = (
        <>
          Instance{" "}
          <InstanceRichChip
            instanceName={instance.name}
            projectName={instance.project}
          />{" "}
          root storage successfully moved to pool{" "}
          <StoragePoolRichChip
            poolName={target}
            projectName={instance.project}
            location={instance.location}
          />
        </>
      );
    }

    if (type === "project") {
      successMessage = (
        <>
          Instance{" "}
          <InstanceRichChip instanceName={instance.name} projectName={target} />
          successfully moved to project <ProjectRichChip projectName={target} />
        </>
      );

      const oldUrl = window.location.pathname;
      const newUrl = oldUrl.replace(
        `${ROOT_PATH}/ui/project/${instance.project}/instance/${instance.name}`,
        `${ROOT_PATH}/ui/project/${target}/instance/${instance.name}`,
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
      failureMessage = `Root storage move failed for instance ${instance.name}`;
    }

    if (type === "project") {
      failureMessage = `Project move failed for instance ${instance.name}`;
    }

    instanceLoading.setFinish(instance);
    toastNotify.failure(
      failureMessage,
      e,
      <InstanceRichChip
        instanceName={instance.name}
        projectName={instance.project}
      />,
    );
  };

  const handleFailure = (msg: string) => {
    notifyFailure(new Error(msg));
  };

  const handleFinish = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.instances, instance.name, instance.project],
    });
    queryClient.invalidateQueries({
      queryKey: [queryKeys.instances, instance.project],
    });
    queryClient.invalidateQueries({
      queryKey: [queryKeys.operations, instance.project],
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
          (err) => {
            handleFailure(err);
          },
          handleFinish,
        );
        toastNotify.info(
          <>
            {capitalizeFirstLetter(type)} migration started for{" "}
            <InstanceRichChip
              instanceName={instance.name}
              projectName={instance.project}
            />
            .
          </>,
        );
        queryClient.invalidateQueries({
          queryKey: [queryKeys.instances, instance.name, instance.project],
        });
      })
      .catch((e) => {
        notifyFailure(e);
      })
      .finally(() => {
        close();
      });
  };

  return {
    handleMigrate,
  };
};
