import type { FC } from "react";
import { Link } from "react-router-dom";
import { Chip } from "@canonical/react-components";
import { useAuth } from "context/auth";
import { useCurrentProject } from "context/useCurrentProject";
import { useIsClustered } from "context/useIsClustered";
import { useStoragePoolResources } from "context/useStoragePoolResources";
import StoragePoolSize from "pages/storage/StoragePoolSize";
import type { LxdStoragePool } from "types/storage";
import { ensureArray, pluralize } from "util/helpers";
import { ALL_PROJECTS } from "util/projects";
import { ROOT_PATH } from "util/rootPath";
import { getVolumesUsedByPool, isClusterLocalDriver } from "util/storagePool";

interface Props {
  pool: LxdStoragePool;
}

const StoragePoolDetails: FC<Props> = ({ pool }) => {
  const isClustered = useIsClustered();
  const { defaultProject } = useAuth();
  const { projectName: currentProject } = useCurrentProject();
  const { data: resources } = useStoragePoolResources(pool);
  const volumeCount = getVolumesUsedByPool(pool).length;
  const hasClusterMemberSpecificSize =
    isClustered &&
    isClusterLocalDriver(pool.driver) &&
    ensureArray(resources).length > 1;
  const project =
    currentProject === ALL_PROJECTS ? defaultProject : currentProject;
  const poolDetailUrl = `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/storage/pool/${encodeURIComponent(pool.name)}`;

  return (
    <div className="storage-pool-details">
      <p className="u-truncate" title={pool.name}>
        <Link to={poolDetailUrl}>
          <b>{pool.name}</b>
        </Link>
        {pool.status === "Errored" && (
          <>
            <br />
            <Chip
              className="u-no-margin"
              appearance="negative"
              value="Errored"
              lead="status"
              isReadOnly
            />
          </>
        )}
      </p>

      <p>
        {volumeCount} {pluralize("volume", volumeCount)}
      </p>

      {hasClusterMemberSpecificSize ? (
        <p className="u-no-margin--bottom">
          Usage varies per member.{" "}
          <Link to={poolDetailUrl}>See pool details</Link>
        </p>
      ) : (
        <StoragePoolSize pool={pool} hasMeterBar hasPercentage />
      )}
    </div>
  );
};

export default StoragePoolDetails;
