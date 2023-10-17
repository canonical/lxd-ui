import React, { FC } from "react";
import {
  Input,
  RadioInput,
  Select,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { fetchResources } from "api/server";
import { queryKeys } from "util/queryKeys";
import { BYTES_UNITS, MemoryLimit, MEM_LIMIT_TYPE } from "types/limits";
import { humanFileSize } from "util/helpers";
import Loader from "components/Loader";

interface Props {
  memoryLimit?: MemoryLimit;
  setMemoryLimit: (memoryLimit: MemoryLimit) => void;
}

const MemoryLimitSelector: FC<Props> = ({ memoryLimit, setMemoryLimit }) => {
  const notify = useNotify();
  if (!memoryLimit) {
    return null;
  }

  const {
    data: resources,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.resources],
    queryFn: fetchResources,
  });

  if (isLoading) {
    return <Loader text="Loading resources..." />;
  }

  if (error) {
    notify.failure("Loading resources failed", error);
  }

  const maxMemory = resources?.memory.total;

  const getMemUnitOptions = () => {
    return Object.values(BYTES_UNITS).map((unit) => ({
      label: unit,
      value: unit,
    }));
  };

  const getFormattedMaxValue = (unit: BYTES_UNITS): number | undefined => {
    if (!maxMemory) return undefined;
    switch (unit) {
      case BYTES_UNITS.B:
        return maxMemory;
      case BYTES_UNITS.KB:
        return maxMemory / 10 ** 3;
      case BYTES_UNITS.MB:
        return maxMemory / 10 ** 6;
      case BYTES_UNITS.GB:
        return maxMemory / 10 ** 9;
      case BYTES_UNITS.TB:
        return maxMemory / 10 ** 12;
      case BYTES_UNITS.PB:
        return maxMemory / 10 ** 15;
      case BYTES_UNITS.EB:
        return maxMemory / 10 ** 18;
      case BYTES_UNITS.KIB:
        return maxMemory / 2 ** 10;
      case BYTES_UNITS.MIB:
        return maxMemory / (2 ** 10) ** 2;
      case BYTES_UNITS.GIB:
        return maxMemory / (2 ** 10) ** 3;
      case BYTES_UNITS.TIB:
        return maxMemory / (2 ** 10) ** 4;
      case BYTES_UNITS.PIB:
        return maxMemory / (2 ** 10) ** 5;
      case BYTES_UNITS.EIB:
        return maxMemory / (2 ** 10) ** 6;
    }
  };

  const getTotalMemory = () => {
    if (!maxMemory) {
      return "";
    }
    if (memoryLimit.unit === "%") {
      return humanFileSize(maxMemory, true);
    }
    const formattedValue = getFormattedMaxValue(memoryLimit.unit) ?? 0;
    if (formattedValue < 1) {
      return `${formattedValue} ${memoryLimit.unit}`;
    }
    return `${Number(formattedValue.toFixed(1))} ${memoryLimit.unit}`;
  };

  const helpText = maxMemory && (
    <>
      Total memory: <b>{getTotalMemory()}</b>
    </>
  );

  return (
    <div>
      <div className="memory-limit-label">
        <RadioInput
          label="absolute"
          checked={memoryLimit.selectedType === MEM_LIMIT_TYPE.FIXED}
          onChange={() =>
            setMemoryLimit({
              unit: BYTES_UNITS.GIB,
              selectedType: MEM_LIMIT_TYPE.FIXED,
            })
          }
        />
        <RadioInput
          label="percentage"
          checked={memoryLimit.selectedType === MEM_LIMIT_TYPE.PERCENT}
          onChange={() =>
            setMemoryLimit({ unit: "%", selectedType: MEM_LIMIT_TYPE.PERCENT })
          }
        />
      </div>
      {memoryLimit.selectedType === MEM_LIMIT_TYPE.PERCENT && (
        <Input
          id="limits_memory"
          name="limits_memory"
          type="number"
          min="0"
          max="100"
          step="Any"
          placeholder="Enter percentage"
          onChange={(e) =>
            setMemoryLimit({ ...memoryLimit, value: +e.target.value })
          }
          value={`${memoryLimit.value ? memoryLimit.value : ""}`}
          help={helpText}
        />
      )}
      {memoryLimit.selectedType === MEM_LIMIT_TYPE.FIXED && (
        <div className="memory-limit-with-unit">
          <Input
            id="limits_memory"
            name="limits_memory"
            type="number"
            min="0"
            max={getFormattedMaxValue(memoryLimit.unit as BYTES_UNITS)}
            step="Any"
            placeholder="Enter value"
            onChange={(e) =>
              setMemoryLimit({ ...memoryLimit, value: +e.target.value })
            }
            value={`${memoryLimit.value ? memoryLimit.value : ""}`}
            help={helpText}
          />
          <Select
            id="memUnitSelect"
            name="memUnitSelect"
            options={getMemUnitOptions()}
            onChange={(e) =>
              setMemoryLimit({
                ...memoryLimit,
                unit: e.target.value as BYTES_UNITS,
              })
            }
            value={memoryLimit.unit}
          />
        </div>
      )}
    </div>
  );
};

export default MemoryLimitSelector;
