import type { FC } from "react";
import { Input, RadioInput, Select } from "@canonical/react-components";
import type { MemoryLimit } from "types/limits";
import { BYTES_UNITS, MEM_LIMIT_TYPE } from "types/limits";
import MemoryLimitAvailable from "components/forms/MemoryLimitAvailable";
import { useCurrentProject } from "context/useCurrentProject";

interface Props {
  memoryLimit?: MemoryLimit;
  setMemoryLimit: (memoryLimit: MemoryLimit) => void;
}

const MemoryLimitSelector: FC<Props> = ({ memoryLimit, setMemoryLimit }) => {
  const { project } = useCurrentProject();

  if (!memoryLimit) {
    return null;
  }

  const getMemUnitOptions = () => {
    return Object.values(BYTES_UNITS).map((unit) => ({
      label: unit,
      value: unit,
    }));
  };

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
          help={<MemoryLimitAvailable project={project} />}
        />
      )}
      {memoryLimit.selectedType === MEM_LIMIT_TYPE.FIXED && (
        <div className="memory-limit-with-unit">
          <Input
            id="limits_memory"
            name="limits_memory"
            type="number"
            min="0"
            step="Any"
            placeholder="Enter value"
            onChange={(e) =>
              setMemoryLimit({ ...memoryLimit, value: +e.target.value })
            }
            value={`${memoryLimit.value ? memoryLimit.value : ""}`}
            help={<MemoryLimitAvailable project={project} />}
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
