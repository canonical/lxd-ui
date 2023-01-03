import React, { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { NotificationHelper } from "../types/notification";
import { queryKeys } from "../util/queryKeys";
import { LxdDiskDevice } from "../types/device";
import { fetchStorages } from "../api/storages";
import Loader from "./Loader";

interface Props {
  notify: NotificationHelper;
  diskDevice: LxdDiskDevice;
  setDiskDevice: (diskDevice: LxdDiskDevice) => void;
  hasPathInput?: boolean;
}

const StorageSelector: FC<Props> = ({
  notify,
  diskDevice: diskDevice,
  setDiskDevice: setDiskDevice,
  hasPathInput = true,
}) => {
  const {
    data: storagePools = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: fetchStorages,
  });

  if (isLoading) {
    return <Loader text="Loading storage pools..." />;
  }

  if (error) {
    notify.failure("Could not load storage pools.", error);
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
