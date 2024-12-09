import { FC, useEffect } from "react";
import { useNotify } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchStoragePools } from "api/storage-pools";
import Loader from "components/Loader";
import { Props as SelectProps } from "@canonical/react-components/dist/components/Select/Select";
import { useSettings } from "context/useSettings";
import { getSupportedStorageDrivers } from "util/storageOptions";
import CustomSelect from "components/select/CustomSelect";
import { CustomSelectOption } from "components/select/CustomSelectDropdown";
import StoragePoolOptionLabel from "./StoragePoolOptionLabel";
import StoragePoolOptionHeader from "./StoragePoolOptionHeader";

interface Props {
  value: string;
  setValue: (value: string) => void;
  selectProps?: SelectProps;
  hidePoolsWithUnsupportedDrivers?: boolean;
}

const StoragePoolSelector: FC<Props> = ({
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
    queryFn: () => fetchStoragePools(),
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
    const options: CustomSelectOption[] = [];
    if (poolsToUse) {
      poolsToUse.forEach((pool) => {
        options.push({
          label: <StoragePoolOptionLabel pool={pool} />,
          value: pool.name,
          disabled: false,
          text: `${pool.name} (${pool.driver})`,
        });
      });
      if (poolsToUse.length === 0) {
        options.unshift({
          label: "No storage pool available",
          value: "",
          disabled: true,
        });
      }
    }

    return options;
  };

  const handleStoragePoolChange = (value: string) => {
    setValue(value);
  };

  return (
    <CustomSelect
      name="pool"
      aria-label="Storage Pool"
      searchable="auto"
      {...selectProps}
      options={getStoragePoolOptions()}
      onChange={handleStoragePoolChange}
      value={value}
      dropdownClassName="storage-pool-select-dropdown"
      header={<StoragePoolOptionHeader />}
    />
  );
};

export default StoragePoolSelector;
