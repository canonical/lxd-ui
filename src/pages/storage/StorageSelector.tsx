import React, { FC } from "react";
import { Input, Select, useNotify } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { LxdDiskDevice } from "types/device";
import { fetchStoragePools } from "api/storage-pools";
import Loader from "components/Loader";

interface Props {
  project: string;
  diskDevice: LxdDiskDevice;
  setDiskDevice: (diskDevice: LxdDiskDevice) => void;
  hasPathInput?: boolean;
}

const StorageSelector: FC<Props> = ({
  project,
  diskDevice: diskDevice,
  setDiskDevice: setDiskDevice,
  hasPathInput = true,
}) => {
  const notify = useNotify();
  const {
    data: storagePools = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: () => fetchStoragePools(project),
  });

  if (isLoading) {
    return <Loader text="Loading storage pools..." />;
  }

  if (error) {
    notify.failure("Loading storage pools failed", error);
  }

  const getStoragePoolOptions = () => {
    const options = storagePools.map((storagePool) => {
      return {
        label: storagePool.name,
        value: storagePool.name,
        disabled: false,
      };
    });
    options.unshift({
      label:
        storagePools.length === 0
          ? "No storage pool available"
          : "Select option",
      value: "",
      disabled: true,
    });
    return options;
  };

  return (
    <>
      <Select
        name="pool"
        label="Storage pool"
        options={getStoragePoolOptions()}
        onChange={(e) => setDiskDevice({ ...diskDevice, pool: e.target.value })}
        value={diskDevice.pool}
        stacked
      />
      {hasPathInput && (
        <Input
          id="path"
          name="path"
          type="text"
          label="Path"
          onChange={(e) =>
            setDiskDevice({ ...diskDevice, path: e.target.value })
          }
          value={diskDevice.path}
          stacked
        />
      )}
    </>
  );
};

export default StorageSelector;
