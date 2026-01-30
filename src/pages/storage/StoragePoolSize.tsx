import type { FC } from "react";
import type { LxdStoragePool } from "types/storage";
import { humanFileSize } from "util/helpers";
import Meter from "components/Meter";
import { useClusteredStoragePoolResources } from "context/useStoragePools";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchStoragePoolResources } from "api/storage-pools";
import { isClusterLocalDriver } from "util/storagePool";
import { useIsClustered } from "context/useIsClustered";
import type { LxdClusterMember } from "types/cluster";

interface Props {
  pool: LxdStoragePool;
  hasMeterBar?: boolean;
  member?: LxdClusterMember;
  forceSingleLine?: boolean;
}

const StoragePoolSize: FC<Props> = ({
  pool,
  hasMeterBar,
  member,
  forceSingleLine,
}) => {
  // When a single member is provided, the resource usage is shown for that member only
  const { data: clusteredPoolResources = [] } =
    useClusteredStoragePoolResources(pool.name, member);
  const isClustered = useIsClustered();
  const hasMemberSpecificSize =
    isClusterLocalDriver(pool.driver) && isClustered;

  const { data: poolResources } = useQuery({
    queryKey: [queryKeys.storage, pool.name, queryKeys.resources],
    queryFn: async () => fetchStoragePoolResources(pool.name),
    enabled: !hasMemberSpecificSize,
  });

  const resourceList = hasMemberSpecificSize
    ? clusteredPoolResources
    : [poolResources];

  if (hasMemberSpecificSize && forceSingleLine && !member) {
    return "Cluster member dependent";
  }

  return (
    <div>
      {resourceList.map((poolResource, index) => {
        if (!poolResource) {
          return <div key={`empty-${index}`}>{pool.config?.size}</div>;
        }

        const total = poolResource.space.total;
        const used = poolResource.space.used || 0;
        const resourceKey = poolResource.memberName || `resource-${index}`;

        if (!hasMeterBar) {
          return (
            <div key={resourceKey}>
              {`${humanFileSize(used)} of ${humanFileSize(total)} used`}
            </div>
          );
        }

        return (
          <Meter
            key={resourceKey}
            percentage={(100 / total) * used || 0}
            text={`${humanFileSize(used)} of ${humanFileSize(total)} used`}
          />
        );
      })}
    </div>
  );
};

export default StoragePoolSize;
