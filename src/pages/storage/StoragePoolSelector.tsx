import type { FC } from "react";
import { useEffect } from "react";
import type { CustomSelectOption } from "@canonical/react-components";
import { CustomSelect, useNotify, Spinner } from "@canonical/react-components";
import type { Props as SelectProps } from "@canonical/react-components/dist/components/Select/Select";
import { cephObject } from "util/storageOptions";
import StoragePoolOptionLabel from "./StoragePoolOptionLabel";
import StoragePoolOptionHeader from "./StoragePoolOptionHeader";
import { useStoragePools } from "context/useStoragePools";

interface Props {
  value: string;
  setValue: (value: string) => void;
  selectProps?: SelectProps;
  invalidDrivers?: string[];
}

const StoragePoolSelector: FC<Props> = ({
  value,
  setValue,
  selectProps,
  invalidDrivers = [cephObject],
}) => {
  const notify = useNotify();
  const { data: pools = [], error, isLoading } = useStoragePools();

  const poolsToUse = pools.filter((pool) => {
    return !invalidDrivers.includes(pool.driver);
  });

  useEffect(() => {
    if (!value && poolsToUse.length > 0) {
      setValue(poolsToUse[0].name);
    }
  }, [value, poolsToUse]);

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading storage pools..." />;
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
          selectedLabel: (
            <span>
              {pool.name}&nbsp;
              <span className="u-text--muted">&#40;{pool.driver}&#41;</span>
            </span>
          ),
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
