import { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { BYTES_UNITS } from "types/limits";
import { parseMemoryLimit } from "util/limits";

interface Props {
  label?: string;
  value?: string;
  help?: string;
  setMemoryLimit: (val?: string) => void;
  disabled?: boolean;
}

const DiskSizeSelector: FC<Props> = ({
  label,
  value,
  help,
  setMemoryLimit,
  disabled,
}) => {
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
      {label && (
        <label className="p-form__label" htmlFor="limits_disk">
          {label}
        </label>
      )}
      <div className="memory-limit-with-unit">
        <Input
          id="limits_disk"
          name="limits_disk"
          type="number"
          min="0"
          step="Any"
          placeholder="Enter value"
          onChange={(e) => setMemoryLimit(e.target.value + limit.unit)}
          value={value?.match(/^\d/) ? limit.value : ""}
          disabled={disabled}
        />
        <Select
          id="memUnitSelect"
          name="memUnitSelect"
          label="Select disk size unit"
          labelClassName="u-off-screen"
          options={getMemUnitOptions()}
          onChange={(e) =>
            setMemoryLimit(`${limit.value ?? 0}${e.target.value}`)
          }
          value={limit.unit}
          disabled={disabled}
        />
      </div>
      {help && <p className="p-form-help-text">{help}</p>}
    </div>
  );
};

export default DiskSizeSelector;
