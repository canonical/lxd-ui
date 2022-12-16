import React, { FC } from "react";
import {
  Col,
  Input,
  Label,
  RadioInput,
  Row,
} from "@canonical/react-components";
import { fetchResources } from "../api/server";
import { useQuery } from "@tanstack/react-query";
import { NotificationHelper } from "../types/notification";
import { queryKeys } from "../util/queryKeys";
import { CpuLimit, CPU_LIMIT_TYPE } from "../types/limits";

interface Props {
  notify: NotificationHelper;
  cpuLimit: CpuLimit;
  setCpuLimit: (cpuLimit: CpuLimit) => void;
}

const CpuLimitSelector: FC<Props> = ({ notify, cpuLimit, setCpuLimit }) => {
  const { data: resources, error } = useQuery({
    queryKey: [queryKeys.resources],
    queryFn: fetchResources,
  });

  if (error) {
    notify.failure("Could not load resources.", error);
  }

  const numberOfCores = resources?.cpu.total;

  return (
    <>
      <Label>Exposed CPUs</Label>
      <RadioInput
        label="dynamic (load-balancing)"
        checked={cpuLimit.selectedType === CPU_LIMIT_TYPE.DYNAMIC}
        onChange={() => setCpuLimit({ selectedType: CPU_LIMIT_TYPE.DYNAMIC })}
      />
      <RadioInput
        label="fixed range (pinned to cores)"
        checked={cpuLimit.selectedType === CPU_LIMIT_TYPE.FIXED_RANGE}
        onChange={() =>
          setCpuLimit({ selectedType: CPU_LIMIT_TYPE.FIXED_RANGE })
        }
      />
      <RadioInput
        label="fixed set (pinned to cores)"
        checked={cpuLimit.selectedType === CPU_LIMIT_TYPE.FIXED_SET}
        onChange={() => setCpuLimit({ selectedType: CPU_LIMIT_TYPE.FIXED_SET })}
      />
      {cpuLimit.selectedType === CPU_LIMIT_TYPE.DYNAMIC && (
        <Input
          id="dynCpuLimit"
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
        />
      )}
      {cpuLimit.selectedType === CPU_LIMIT_TYPE.FIXED_RANGE && (
        <Row>
          <Col size={6}>
            <Input
              id="rangeCpuLimitFrom"
              name="rangeCpuLimitFrom"
              type="number"
              min="0"
              max={cpuLimit.rangeValue?.to ?? numberOfCores}
              step="1"
              placeholder="From (core #)"
              onChange={(e) =>
                setCpuLimit({
                  ...cpuLimit,
                  rangeValue: {
                    from: +e.target.value,
                    to: cpuLimit.rangeValue?.to ?? null,
                  },
                })
              }
              value={cpuLimit.rangeValue?.from ?? ""}
            />
          </Col>
          <Col size={6}>
            <Input
              id="rangeCpuLimitTo"
              name="rangeCpuLimitTo"
              type="number"
              min={cpuLimit.rangeValue?.from ?? 0}
              max={numberOfCores ? numberOfCores - 1 : undefined}
              step="1"
              placeholder="To (core #)"
              onChange={(e) =>
                setCpuLimit({
                  ...cpuLimit,
                  rangeValue: {
                    from: cpuLimit.rangeValue?.from ?? null,
                    to: +e.target.value,
                  },
                })
              }
              value={cpuLimit.rangeValue?.to ?? ""}
            />
          </Col>
        </Row>
      )}
      {cpuLimit.selectedType === CPU_LIMIT_TYPE.FIXED_SET && (
        <Input
          id="cpuFixedSetLimit"
          name="cpuFixedSetLimit"
          type="text"
          placeholder="Comma-separated core numbers"
          onChange={(e) =>
            setCpuLimit({ ...cpuLimit, setValue: e.target.value })
          }
          value={cpuLimit.setValue ?? ""}
        />
      )}
      <p>
        <span>
          See docs for the{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://linuxcontainers.org/lxd/docs/latest/reference/instance_options/#cpu-limits"
          >
            allowed formats
          </a>
          .
        </span>
      </p>
      {numberOfCores && (
        <p>
          <span>
            Total number of CPU cores: <b>{numberOfCores}</b>
          </span>
        </p>
      )}
    </>
  );
};

export default CpuLimitSelector;
