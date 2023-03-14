import React, { FC } from "react";
import { Input, Label, RadioInput } from "@canonical/react-components";
import { fetchResources } from "api/server";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { CpuLimit, CPU_LIMIT_TYPE } from "types/limits";
import Loader from "components/Loader";
import { useNotify } from "context/notify";

interface Props {
  cpuLimit: CpuLimit;
  setCpuLimit: (cpuLimit: CpuLimit) => void;
}

const CpuLimitSelector: FC<Props> = ({ cpuLimit, setCpuLimit }) => {
  const notify = useNotify();

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
    notify.failure("Could not load resources.", error);
  }

  const numberOfCores = resources?.cpu.total;
  const helpText = numberOfCores && (
    <>
      Total number of CPU cores: <b>{numberOfCores}</b>
    </>
  );

  return (
    <>
      <div className="cpu-limit-label">
        <Label className="grow" forId="cpuLimit">
          Exposed CPUs
        </Label>
        <RadioInput
          labelClassName="right-margin"
          label="number"
          checked={cpuLimit.selectedType === CPU_LIMIT_TYPE.DYNAMIC}
          onChange={() => setCpuLimit({ selectedType: CPU_LIMIT_TYPE.DYNAMIC })}
        />
        <RadioInput
          label="fixed"
          checked={cpuLimit.selectedType === CPU_LIMIT_TYPE.FIXED_SET}
          onChange={() =>
            setCpuLimit({ selectedType: CPU_LIMIT_TYPE.FIXED_SET })
          }
        />
      </div>
      {cpuLimit.selectedType === CPU_LIMIT_TYPE.DYNAMIC && (
        <Input
          id="cpuLimit"
          name="dynCpuLimit"
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
      {cpuLimit.selectedType === CPU_LIMIT_TYPE.FIXED_SET && (
        <Input
          id="cpuLimit"
          name="cpuFixedSetLimit"
          type="text"
          placeholder="Comma-separated core numbers"
          onChange={(e) =>
            setCpuLimit({ ...cpuLimit, setValue: e.target.value })
          }
          value={cpuLimit.setValue ?? ""}
          help={helpText}
        />
      )}
    </>
  );
};

export default CpuLimitSelector;
