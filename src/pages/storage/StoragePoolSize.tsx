import type { FC } from "react";
import type { LxdStoragePool } from "types/storage";
import { ensureArray, humanFileSize } from "util/helpers";
import Meter from "components/Meter";
import { isClusterLocalDriver } from "util/storagePool";
import { useIsClustered } from "context/useIsClustered";
import type { LxdClusterMember } from "types/cluster";
import { useStoragePoolResources } from "context/useStoragePoolResources";

interface Props {
  pool: LxdStoragePool;
  hasMeterBar?: boolean;
  member?: LxdClusterMember;
  forceSingleLine?: boolean;
  hasPercentage?: boolean;
}

const StoragePoolSize: FC<Props> = ({
  pool,
  hasMeterBar,
  member,
  forceSingleLine,
  hasPercentage,
}) => {
  // When a single member is provided, the resource usage is shown for that member only

  const isClustered = useIsClustered();
  const hasMemberSpecificSize =
    isClusterLocalDriver(pool.driver) && isClustered;
  const { data: resources } = useStoragePoolResources(pool, member);
  const resourceList = ensureArray(resources);

  if (
    hasMemberSpecificSize &&
    forceSingleLine &&
    !member &&
    resourceList.length > 1
  ) {
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

        const usedPercentage = total > 0 ? (used * 100) / total : 0;

        if (!hasMeterBar) {
          return (
            <div key={resourceKey}>
              {`${humanFileSize(used, 0)} of ${humanFileSize(total, 0)} used`}
            </div>
          );
        }

        return (
          <Meter
            key={resourceKey}
            percentage={usedPercentage}
            text={
              `${humanFileSize(used, 0)} of ${humanFileSize(total, 0)} used` +
              (hasPercentage ? ` (${Math.round(usedPercentage)}%)` : "")
            }
          />
        );
      })}
    </div>
  );
};

export default StoragePoolSize;
