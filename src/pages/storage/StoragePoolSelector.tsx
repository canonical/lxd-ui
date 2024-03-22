import { FC, useEffect } from "react";
import { Select, useNotify } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchStoragePools } from "api/storage-pools";
import Loader from "components/Loader";
import { Props as SelectProps } from "@canonical/react-components/dist/components/Select/Select";
import { useSettings } from "context/useSettings";
import { getSupportedStorageDrivers } from "util/storageOptions";

interface Props {
  project: string;
  value: string;
  setValue: (value: string) => void;
  selectProps?: SelectProps;
  hidePoolsWithUnsupportedDrivers?: boolean;
}

const StoragePoolSelector: FC<Props> = ({
  project,
  value,
  setValue,
  selectProps,
  hidePoolsWithUnsupportedDrivers = false,
}) => {
  const notify = useNotify();
  const { data: settings } = useSettings();
  const {
    data: pools = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: () => fetchStoragePools(project),
  });

  const supportedStorageDrivers = getSupportedStorageDrivers(settings);
  const poolsWithSupportedDriver = pools.filter((pool) =>
    supportedStorageDrivers.has(pool.driver),
  );

  const poolsToUse = hidePoolsWithUnsupportedDrivers
    ? poolsWithSupportedDriver
    : pools;

  useEffect(() => {
    if (!value && poolsToUse.length > 0) {
      setValue(poolsToUse[0].name);
    }
  }, [value, poolsToUse]);

  if (isLoading) {
    return <Loader text="Loading storage pools..." />;
  }

  if (error) {
    notify.failure("Loading storage pools failed", error);
  }

  const getStoragePoolOptions = () => {
    const options = poolsToUse.map((pool) => {
      return {
        label: pool.name,
        value: pool.name,
        disabled: false,
      };
    });
    options.unshift({
      label:
        poolsToUse.length === 0 ? "No storage pool available" : "Select option",
      value: "",
      disabled: true,
    });
    return options;
  };

  return (
    <Select
      id="storage-pool-selector"
      name="pool"
      options={getStoragePoolOptions()}
      onChange={(e) => setValue(e.target.value)}
      value={value}
      {...selectProps}
    />
  );
};

export default StoragePoolSelector;
