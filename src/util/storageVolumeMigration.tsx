import { useToastNotification } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import {
  copyStorageVolume,
  deleteStorageVolume,
  getCopyStorageVolumePayload,
  migrateStorageVolume,
} from "api/storage-volumes";
import ResourceLink from "components/ResourceLink";
import { useEventQueue } from "context/eventQueue";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { LxdStorageVolume } from "types/storage";
import { capitalizeFirstLetter } from "./helpers";
import { queryKeys } from "./queryKeys";
import { linkForVolumeDetail } from "./storageVolume";
import VolumeLinkChip from "pages/storage/VolumeLinkChip";
import ProjectRichChip from "pages/projects/ProjectRichChip";
import { ROOT_PATH } from "util/rootPath";

export type VolumeMigrationType = "cluster member" | "pool" | "project" | "";

interface Props {
  volume: LxdStorageVolume;
  type: VolumeMigrationType;
  target: string;
  close: () => void;
}

export const useStorageVolumeMigration = ({
  volume,
  close,
  type,
  target,
}: Props) => {
  const toastNotify = useToastNotification();
  const eventQueue = useEventQueue();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleSuccess = () => {
    let successMessage: ReactNode = "";

    const oldVolumeDetailPage = linkForVolumeDetail(volume);
    const newVolumeDetailPage = linkForVolumeDetail({
      ...volume,
      project: type === "project" ? target : volume.project,
      pool: type === "pool" ? target : volume.pool,
      location: type === "cluster member" ? target : volume.location,
    } as LxdStorageVolume);

    const poolLink = (
      <ResourceLink
        type="pool"
        value={target}
        to={`${ROOT_PATH}/ui/project/${encodeURIComponent(volume.project)}/storage/pool/${encodeURIComponent(target)}`}
      />
    );

    if (type === "cluster member") {
      successMessage = (
        <>
          Volume <VolumeLinkChip volume={{ ...volume, location: target }} />{" "}
          successfully migrated to cluster member{" "}
          <ResourceLink
            type="cluster-member"
            value={target}
            to={`${ROOT_PATH}/ui/cluster/member/${encodeURIComponent(target)}`}
          />
        </>
      );

      if (oldVolumeDetailPage !== newVolumeDetailPage) {
        navigate(newVolumeDetailPage);
      }
    }

    if (type === "pool") {
      successMessage = (
        <>
          Volume <VolumeLinkChip volume={{ ...volume, pool: target }} />
          successfully migrated to pool {poolLink}
        </>
      );
      if (oldVolumeDetailPage !== newVolumeDetailPage) {
        navigate(newVolumeDetailPage);
      }
    }

    if (type === "project") {
      successMessage = (
        <>
          Volume <VolumeLinkChip volume={{ ...volume, project: target }} />
          successfully moved to project <ProjectRichChip projectName={target} />
        </>
      );

      if (oldVolumeDetailPage !== newVolumeDetailPage) {
        navigate(newVolumeDetailPage);
      }
    }

    toastNotify.success(successMessage);
  };

  const notifyFailure = (e: unknown) => {
    let failureMessage = "";
    if (type === "cluster member") {
      failureMessage = `Cluster member migration failed for volume ${volume.name}`;
    }

    if (type === "pool") {
      failureMessage = `Migration failed for volume ${volume.name} to pool ${target}`;
    }

    if (type === "project") {
      failureMessage = `Project move failed for volume ${volume.name}`;
    }

    toastNotify.failure(failureMessage, e, <VolumeLinkChip volume={volume} />);
  };

  const handleFailure = (msg: string) => {
    notifyFailure(new Error(msg));
  };

  const handleFinish = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.volumes, volume.name, volume.project],
    });
    queryClient.invalidateQueries({
      queryKey: [queryKeys.volumes, volume.project],
    });
    queryClient.invalidateQueries({
      queryKey: [queryKeys.operations, volume.project],
    });
  };

  const handleMigrate = () => {
    const targetPool = type === "pool" ? target : undefined;
    const targetProject = type === "project" ? target : undefined;

    migrateStorageVolume(
      volume,
      volume.project,
      targetPool,
      volume.location,
      targetProject,
    )
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            handleSuccess();
          },
          (err) => {
            handleFailure(err);
          },
          handleFinish,
        );
        toastNotify.info(
          <>
            {capitalizeFirstLetter(type)} migration started for{" "}
            <VolumeLinkChip volume={volume} />.
          </>,
        );
        queryClient.invalidateQueries({
          queryKey: [queryKeys.volumes, volume.name, volume.project],
        });
      })
      .catch((e) => {
        notifyFailure(e);
      })
      .finally(() => {
        close();
      });
  };

  const handleMemberMigrate = () => {
    // Copies volume to a new cluster member and deletes the old volume.
    const targetMember = type === "cluster member" ? target : undefined;
    const oldMember = volume.location;
    const payload = getCopyStorageVolumePayload(
      volume,
      volume.name,
      volume.project,
    );

    copyStorageVolume(payload, volume.pool, volume.project, targetMember)
      .then((operation) => {
        toastNotify.info(
          <>
            {capitalizeFirstLetter(type)} migration started for{" "}
            <VolumeLinkChip volume={volume} />.
          </>,
        );
        eventQueue.set(
          operation.metadata.id,
          () => {
            queryClient.invalidateQueries({
              queryKey: [queryKeys.volumes, volume.name, volume.project],
            });

            deleteStorageVolume(
              volume.name,
              volume.pool,
              volume.project,
              oldMember,
            ).then((operation) => {
              eventQueue.set(
                operation.metadata.id,
                () => {
                  handleSuccess();
                },
                (err) => {
                  handleFailure(err);
                },
                handleFinish,
              );

              queryClient.invalidateQueries({
                queryKey: [queryKeys.isoVolumes],
              });
              queryClient.invalidateQueries({
                queryKey: [queryKeys.projects, volume.project],
              });
              queryClient.invalidateQueries({
                queryKey: [
                  queryKeys.storage,
                  volume.pool,
                  queryKeys.volumes,
                  volume.project,
                  volume.location,
                ],
              });
              queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === queryKeys.volumes,
              });
            });
          },
          (err) => {
            handleFailure(err);
          },
          handleFinish,
        );
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
    handleMemberMigrate,
  };
};
