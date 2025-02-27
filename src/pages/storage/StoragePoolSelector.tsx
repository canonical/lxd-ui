import type { FC } from "react";
import { useEffect } from "react";
import type { CustomSelectOption } from "@canonical/react-components";
import { CustomSelect, useNotify } from "@canonical/react-components";
import Loader from "components/Loader";
import type { Props as SelectProps } from "@canonical/react-components/dist/components/Select/Select";
import { useSettings } from "context/useSettings";
import { getSupportedStorageDrivers } from "util/storageOptions";
import StoragePoolOptionLabel from "./StoragePoolOptionLabel";
import StoragePoolOptionHeader from "./StoragePoolOptionHeader";
import { useStoragePools } from "context/useStoragePools";

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
  const { data: pools = [], error, isLoading } = useStoragePools();

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
