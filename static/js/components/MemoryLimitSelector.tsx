import React, { FC } from "react";
import {
  Col,
  Input,
  Label,
  RadioInput,
  Row,
  Select,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { fetchResources } from "../api/server";
import { queryKeys } from "../util/queryKeys";
import { NotificationHelper } from "../types/notification";
import { MEM_UNITS, MemoryLimit, MEM_LIMIT_TYPE } from "../types/limits";
import { DEFAULT_MEM_LIMIT } from "../util/defaults";

interface Props {
  notify: NotificationHelper;
  memoryLimit: MemoryLimit;
  setMemoryLimit: (memoryLimit: MemoryLimit) => void;
}

const MemoryLimitSelector: FC<Props> = ({
  notify,
  memoryLimit,
  setMemoryLimit,
}) => {
  const { data: resources, error } = useQuery({
    queryKey: [queryKeys.resources],
    queryFn: fetchResources,
  });

  if (error) {
    notify.failure("Could not load resources.", error);
  }

  const maxMemory = resources?.memory.total;

  const getMemUnitOptions = () => {
    return Object.values(MEM_UNITS).map((unit) => ({
      label: unit,
      value: unit,
    }));
  };

  return (
    <>
      <Label>Memory limit</Label>
      <RadioInput
        label="fixed (bytes)"
        checked={memoryLimit.selectedType === MEM_LIMIT_TYPE.FIXED}
        onChange={() => setMemoryLimit(DEFAULT_MEM_LIMIT)}
      />
      <RadioInput
        label="% of the host"
        checked={memoryLimit.selectedType === MEM_LIMIT_TYPE.PERCENT}
        onChange={() =>
          setMemoryLimit({ unit: "%", selectedType: MEM_LIMIT_TYPE.PERCENT })
        }
      />
      {memoryLimit.selectedType === MEM_LIMIT_TYPE.PERCENT && (
        <Input
          id="percentMemLimit"
          name="percentMemLimit"
          type="number"
          min="0.1"
          max="100"
          step="Any"
          placeholder="Enter value"
          onChange={(e) =>
            setMemoryLimit({ ...memoryLimit, value: +e.target.value })
          }
          value={`${memoryLimit.value ? memoryLimit.value : ""}`}
        />
      )}
      {memoryLimit.selectedType === MEM_LIMIT_TYPE.FIXED && (
        <Row>
          <Col size={6}>
            <Input
              id="fixedMemLimit"
              name="fixedMemLimit"
              type="number"
              min="0.1"
              max={maxMemory}
              step="Any"
              placeholder="Enter value"
              onChange={(e) =>
                setMemoryLimit({ ...memoryLimit, value: +e.target.value })
              }
              value={`${memoryLimit.value ? memoryLimit.value : ""}`}
            />
          </Col>
          <Col size={6}>
            <Select
              name="unitSelect"
              options={getMemUnitOptions()}
              onChange={(e) =>
                setMemoryLimit({
                  ...memoryLimit,
                  unit: e.target.value as MEM_UNITS,
                })
              }
              value={memoryLimit.unit}
            />
          </Col>
        </Row>
      )}
    </>
  );
};

export default MemoryLimitSelector;
