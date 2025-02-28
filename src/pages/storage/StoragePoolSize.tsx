import { Fragment, type FC } from "react";
import type { LxdStoragePool } from "types/storage";
import { humanFileSize } from "util/helpers";
import Meter from "components/Meter";
import { useClusteredStoragePoolResources } from "context/useStoragePools";
import { isClusteredServer } from "util/settings";
import { useSettings } from "context/useSettings";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchStoragePoolResources } from "api/storage-pools";
import { hasPoolMemberSpecificSize } from "util/storagePool";

interface Props {
  pool: LxdStoragePool;
  hasMeterBar?: boolean;
}

const StoragePoolSize: FC<Props> = ({ pool, hasMeterBar }) => {
  const { data: clusteredPoolResources = [] } =
    useClusteredStoragePoolResources(pool.name);
  const { data: settings } = useSettings();
  const isClustered = isClusteredServer(settings);
  const hasMemberSpecificSize =
    hasPoolMemberSpecificSize(pool.driver) && isClustered;

  const { data: poolResources } = useQuery({
    queryKey: [queryKeys.storage, pool.name, queryKeys.resources],
    queryFn: async () => fetchStoragePoolResources(pool.name),
    enabled: !hasMemberSpecificSize,
  });
  const resourceList = hasMemberSpecificSize
    ? clusteredPoolResources
    : [poolResources];

  if (!hasMeterBar && hasMemberSpecificSize) {
    return "Cluster member dependent";
  }

  return (
    <div>
      {resourceList.map((poolResource, index) => {
        if (!poolResource) {
          return <>{pool.config?.size}</>;
        }

        const total = poolResource.space.total;
        const used = poolResource.space.used || 0;

        if (!hasMeterBar) {
          return (
            <div key={index}>
              {`${humanFileSize(used)} of ${humanFileSize(total)} used`}
            </div>
          );
        }

        return (
          <Fragment key={index}>
            <Meter
              key={index}
              percentage={(100 / total) * used || 0}
              text={`${humanFileSize(used)} of ${humanFileSize(total)} used`}
            />
          </Fragment>
        );
      })}
    </div>
  );
};

export default StoragePoolSize;
