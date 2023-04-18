import React, { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { BYTES_UNITS } from "types/limits";
import { parseMemoryLimit } from "util/limits";

interface Props {
  value?: string;
  setMemoryLimit: (val?: string) => void;
  helpText: string;
}

const DiskSizeSelector: FC<Props> = ({ value, setMemoryLimit, helpText }) => {
  const limit = parseMemoryLimit(value) ?? {
    value: 1,
    unit: BYTES_UNITS.GIB,
  };

  const getMemUnitOptions = () => {
    return Object.values(BYTES_UNITS).map((unit) => ({
      label: unit,
      value: unit,
    }));
  };

  return (
    <div>
      <div className="memory-limit-with-unit">
        <Input
          id="limits_disk"
          name="limits_disk"
          type="number"
          min="0"
          step="Any"
          placeholder="Enter value"
          onChange={(e) => setMemoryLimit(e.target.value + limit.unit)}
          value={limit.value}
          help={helpText}
        />
        <Select
          id="memUnitSelect"
          name="memUnitSelect"
          options={getMemUnitOptions()}
          onChange={(e) =>
            setMemoryLimit(`${limit.value ?? 0}${e.target.value}`)
          }
          value={limit.unit}
        />
      </div>
    </div>
  );
};

export default DiskSizeSelector;
