import { FC } from "react";
import { fetchStoragePoolResources } from "api/storage-pools";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { LxdStoragePool } from "types/storage";
import { humanFileSize } from "util/helpers";
import Meter from "components/Meter";

interface Props {
  pool: LxdStoragePool;
}

const StoragePoolSize: FC<Props> = ({ pool }) => {
  const { data: resources } = useQuery({
    queryKey: [queryKeys.storage, pool.name, queryKeys.resources],
    queryFn: () => fetchStoragePoolResources(pool.name),
  });

  if (!resources) {
    return <>{pool.config?.size}</>;
  }

  const total = resources.space.total;
  const used = resources.space.used || 0;

  return (
    <Meter
      percentage={(100 / total) * used || 0}
      text={`${humanFileSize(used)} of ${humanFileSize(total)} used`}
    />
  );
};

export default StoragePoolSize;
