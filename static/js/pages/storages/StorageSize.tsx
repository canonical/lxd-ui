import React, { FC } from "react";
import { fetchStorageResources } from "api/storages";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { LxdStorage } from "types/storage";
import { humanFileSize } from "util/helpers";
import Meter from "components/Meter";

interface Props {
  storage: LxdStorage;
}

const StorageSize: FC<Props> = ({ storage }) => {
  const { data: resources } = useQuery({
    queryKey: [queryKeys.storage, storage.name, queryKeys.resources],
    queryFn: () => fetchStorageResources(storage.name),
  });

  if (!resources) {
    return <>{storage.config?.size}</>;
  }

  const total = resources.space.total;
  const used = resources.space.used;

  return (
    <>
      <Meter
        percentage={(100 / total) * used}
        text={`${humanFileSize(used)} of ${humanFileSize(total)} used`}
      />
    </>
  );
};

export default StorageSize;
