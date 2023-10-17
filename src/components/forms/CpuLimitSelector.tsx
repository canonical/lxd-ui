import React, { FC } from "react";
import { Input, RadioInput, useNotify } from "@canonical/react-components";
import { fetchResources } from "api/server";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { CpuLimit, CPU_LIMIT_TYPE } from "types/limits";
import Loader from "components/Loader";

interface Props {
  cpuLimit?: CpuLimit;
  setCpuLimit: (cpuLimit: CpuLimit) => void;
}

const CpuLimitSelector: FC<Props> = ({ cpuLimit, setCpuLimit }) => {
  const notify = useNotify();
  if (!cpuLimit) {
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

  const numberOfCores = resources?.cpu.total;
  const helpText = numberOfCores && (
    <>
      Total number of CPU cores: <b>{numberOfCores}</b>
    </>
  );

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
        <Input
          id="limits_cpu"
          name="limits_cpu"
          type="number"
          min="1"
          max={numberOfCores}
          step="1"
          placeholder="Number of exposed cores"
          onChange={(e) =>
            setCpuLimit({ ...cpuLimit, dynamicValue: +e.target.value })
          }
          value={cpuLimit.dynamicValue ?? ""}
          help={helpText}
        />
      )}
      {cpuLimit.selectedType === CPU_LIMIT_TYPE.FIXED && (
        <Input
          id="limits_cpu"
          name="limits_cpu"
          type="text"
          placeholder="Comma-separated core numbers"
          onChange={(e) =>
            setCpuLimit({ ...cpuLimit, fixedValue: e.target.value })
          }
          value={cpuLimit.fixedValue ?? ""}
          help={helpText}
        />
      )}
    </div>
  );
};

export default CpuLimitSelector;
