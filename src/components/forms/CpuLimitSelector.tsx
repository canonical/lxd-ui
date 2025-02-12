import { FC } from "react";
import { RadioInput } from "@canonical/react-components";
import { CpuLimit, CPU_LIMIT_TYPE } from "types/limits";
import CpuLimitInput from "components/forms/CpuLimitInput";
import { useCurrentProject } from "context/useCurrentProject";

interface Props {
  cpuLimit?: CpuLimit;
  setCpuLimit: (cpuLimit: CpuLimit) => void;
  help?: string;
}

const CpuLimitSelector: FC<Props> = ({ cpuLimit, setCpuLimit, help }) => {
  const { project } = useCurrentProject();

  if (!cpuLimit) {
    return null;
  }

  return (
    <div>
      <div className="cpu-limit-label">
        <RadioInput
          label="number"
          checked={cpuLimit.selectedType === CPU_LIMIT_TYPE.DYNAMIC}
          onChange={() => setCpuLimit({ selectedType: CPU_LIMIT_TYPE.DYNAMIC })}
        />
        <RadioInput
          label="fixed"
          checked={cpuLimit.selectedType === CPU_LIMIT_TYPE.FIXED}
          onChange={() => setCpuLimit({ selectedType: CPU_LIMIT_TYPE.FIXED })}
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
          onChange={(e) =>
            setCpuLimit({ ...cpuLimit, dynamicValue: +e.target.value })
          }
          value={cpuLimit.dynamicValue ?? ""}
          project={project}
          help={help}
        />
      )}
      {cpuLimit.selectedType === CPU_LIMIT_TYPE.FIXED && (
        <CpuLimitInput
          id="limits_cpu"
          name="limits_cpu"
          type="text"
          placeholder="Comma-separated core numbers"
          onChange={(e) =>
            setCpuLimit({ ...cpuLimit, fixedValue: e.target.value })
          }
          value={cpuLimit.fixedValue ?? ""}
          project={project}
          help={help}
        />
      )}
    </div>
  );
};

export default CpuLimitSelector;
