import React, { FC } from "react";
import { Select, useNotify } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchStoragePools } from "api/storage-pools";
import Loader from "components/Loader";
import { Props as SelectProps } from "@canonical/react-components/dist/components/Select/Select";

interface Props {
  project: string;
  value: string;
  setValue: (value: string) => void;
  selectProps?: SelectProps;
}

const StoragePoolSelector: FC<Props> = ({
  project,
  value,
  setValue,
  selectProps,
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
    <Select
      name="pool"
      options={getStoragePoolOptions()}
      onChange={(e) => setValue(e.target.value)}
      value={value}
      {...selectProps}
    />
  );
};

export default StoragePoolSelector;
