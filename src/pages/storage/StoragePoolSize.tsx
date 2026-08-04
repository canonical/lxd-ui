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
  displayPercentage?: boolean;
  withColor?: boolean;
}

const StoragePoolSize: FC<Props> = ({
  pool,
  hasMeterBar,
  member,
  forceSingleLine,
  displayPercentage,
  withColor,
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

        const usedPercentage = (100 / total) * used || 0;
        const getMeterColor = (usedPercentage: number) => {
          if (usedPercentage < 80) {
            return "green";
          } else if (usedPercentage < 95) {
            return "orange";
          } else {
            return "red";
          }
        };

        if (!hasMeterBar) {
          return (
            <div key={resourceKey}>
              {`${humanFileSize(used)} of ${humanFileSize(total)} used`}
            </div>
          );
        }

        if (displayPercentage) {
          return (
            <div
              key={resourceKey}
              className="meter-with-percentage u-gap--small"
            >
              <div>
                <Meter
                  percentage={(100 / total) * used || 0}
                  text={`${humanFileSize(used)} of ${humanFileSize(total)} used`}
                  color={
                    withColor
                      ? getMeterColor((used * 100) / total || 0)
                      : undefined
                  }
                />
              </div>
              <span className="percentage p-text--small">
                {Math.round(usedPercentage)}%
              </span>
            </div>
          );
        }

        return (
          <Meter
            key={resourceKey}
            percentage={(100 / total) * used || 0}
            text={`${humanFileSize(used)} of ${humanFileSize(total)} used`}
            color={
              withColor ? getMeterColor((used * 100) / total || 0) : undefined
            }
          />
        );
      })}
    </div>
  );
};

export default StoragePoolSize;
