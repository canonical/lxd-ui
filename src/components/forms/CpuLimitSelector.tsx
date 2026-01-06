import type { FC } from "react";
import { RadioInput } from "@canonical/react-components";
import type { CpuLimit } from "types/limits";
import { CPU_LIMIT_TYPE } from "types/limits";
import CpuLimitInput from "components/forms/CpuLimitInput";
import type { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";

interface Props {
  cpuLimit?: CpuLimit;
  setCpuLimit: (cpuLimit: CpuLimit) => void;
  help?: string;
  formik: InstanceAndProfileFormikProps;
}

const CpuLimitSelector: FC<Props> = ({
  cpuLimit,
  setCpuLimit,
  help,
  formik,
}) => {
  if (!cpuLimit) {
    return null;
  }

  return (
    <div>
      <div className="cpu-limit-label">
        <RadioInput
          label="number"
          checked={cpuLimit.selectedType === CPU_LIMIT_TYPE.DYNAMIC}
          onChange={() => {
            setCpuLimit({ selectedType: CPU_LIMIT_TYPE.DYNAMIC });
          }}
        />
        <RadioInput
          label="fixed"
          checked={cpuLimit.selectedType === CPU_LIMIT_TYPE.FIXED}
          onChange={() => {
            setCpuLimit({ selectedType: CPU_LIMIT_TYPE.FIXED });
          }}
        />
      </div>
      {cpuLimit.selectedType === CPU_LIMIT_TYPE.DYNAMIC && (
        <CpuLimitInput
          id="limits_cpu"
          name="limits_cpu"
          type="number"
          min="1"
          step="1"
          placeholder="Number of exposed cores"
          onChange={(e) => {
            setCpuLimit({ ...cpuLimit, dynamicValue: +e.target.value });
          }}
          value={cpuLimit.dynamicValue ?? ""}
          help={help}
          formik={formik}
        />
      )}
      {cpuLimit.selectedType === CPU_LIMIT_TYPE.FIXED && (
        <CpuLimitInput
          id="limits_cpu"
          name="limits_cpu"
          type="text"
          placeholder="Comma-separated core numbers"
          onChange={(e) => {
            setCpuLimit({ ...cpuLimit, fixedValue: e.target.value });
          }}
          value={cpuLimit.fixedValue ?? ""}
          help={help}
          formik={formik}
        />
      )}
    </div>
  );
};

export default CpuLimitSelector;
