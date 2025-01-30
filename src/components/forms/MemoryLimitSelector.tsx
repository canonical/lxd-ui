import { FC } from "react";
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
import { useProject } from "context/project";
import { formatBytes, limitToBytes } from "util/limits";

interface Props {
  memoryLimit?: MemoryLimit;
  setMemoryLimit: (memoryLimit: MemoryLimit) => void;
}

const MemoryLimitSelector: FC<Props> = ({ memoryLimit, setMemoryLimit }) => {
  const { project } = useProject();
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

  const getAvailableBytes = (): number => {
    const projectLimit = limitToBytes(project?.config["limits.memory"]);

    if (projectLimit === 0) {
      return resources?.memory.total ?? 0;
    }
    if (!resources?.memory.total) {
      return projectLimit;
    }
    return Math.min(resources.memory.total, projectLimit);
  };

  const availableBytes = getAvailableBytes();

  const getMemUnitOptions = () => {
    return Object.values(BYTES_UNITS).map((unit) => ({
      label: unit,
      value: unit,
    }));
  };

  const getAvailableMemory = () => {
    if (!availableBytes) {
      return "";
    }
    if (memoryLimit.unit === "%") {
      return humanFileSize(availableBytes);
    }
    const formattedValue = formatBytes(availableBytes, memoryLimit.unit);
    if (formattedValue < 1) {
      return `${formattedValue} ${memoryLimit.unit}`;
    }
    return `${+formattedValue.toFixed(1)} ${memoryLimit.unit}`;
  };

  const helpText = availableBytes && (
    <>
      Total memory: <b>{getAvailableMemory()}</b>
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
            max={formatBytes(availableBytes, memoryLimit.unit as BYTES_UNITS)}
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
            label="Select memory size unit"
            labelClassName="u-off-screen"
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
