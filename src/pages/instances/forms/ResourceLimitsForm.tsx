import React, { FC, ReactNode } from "react";
import { Col, Input, Row, Select } from "@canonical/react-components";
import { CreateInstanceFormValues } from "pages/instances/CreateInstanceForm";
import MemoryLimitSelector from "./MemoryLimitSelector";
import CpuLimitSelector from "./CpuLimitSelector";
import { CpuLimit, MemoryLimit } from "types/limits";
import classnames from "classnames";
import { cpuLimitToPayload, memoryLimitToPayload } from "util/limits";
import { booleanFields } from "util/instanceOptions";
import {
  SharedFormikTypes,
  SharedFormTypes,
} from "pages/instances/forms/sharedFormTypes";
import OverrideField from "pages/instances/forms/OverrideField";
import { DEFAULT_CPU_LIMIT, DEFAULT_MEM_LIMIT } from "util/defaults";

export interface ResourceLimitsFormValues {
  limits_cpu?: CpuLimit;
  limits_memory?: MemoryLimit;
  limits_memory_swap?: string;
  limits_disk_priority?: number;
  limits_processes?: number;
}

export const resourceLimitsPayload = (values: SharedFormTypes) => {
  return {
    ["limits.cpu"]: cpuLimitToPayload(values.limits_cpu),
    ["limits.memory"]: memoryLimitToPayload(values.limits_memory),
    ["limits.memory.swap"]: values.limits_memory_swap,
    ["limits.disk.priority"]: values.limits_disk_priority?.toString(),
    ["limits.processes"]: values.limits_processes?.toString(),
  };
};

interface Props {
  formik: SharedFormikTypes;
  children?: ReactNode;
}

const ResourceLimitsForm: FC<Props> = ({ formik, children }) => {
  const isInstance = formik.values.type === "instance";
  const isContainerOnlyDisabled =
    isInstance &&
    (formik.values as CreateInstanceFormValues).instanceType !== "container";

  return (
    <>
      {children}
      <Row>
        <Col size={8}>
          <OverrideField
            formik={formik}
            name="limits_cpu"
            label="Exposed CPUs"
            defaultValue={DEFAULT_CPU_LIMIT}
          >
            <CpuLimitSelector
              cpuLimit={formik.values.limits_cpu}
              setCpuLimit={(cpuLimit) => {
                formik.setFieldValue("limits_cpu", cpuLimit);
              }}
            />
          </OverrideField>
          <hr />
          <OverrideField
            formik={formik}
            name="limits_memory"
            label="Memory limit"
            defaultValue={DEFAULT_MEM_LIMIT}
          >
            <MemoryLimitSelector
              memoryLimit={formik.values.limits_memory}
              setMemoryLimit={(memoryLimit) =>
                formik.setFieldValue("limits_memory", memoryLimit)
              }
            />
          </OverrideField>
          <OverrideField
            formik={formik}
            name="limits_memory_swap"
            label="Memory swap (Containers only)"
            defaultValue="true"
            disabled={isContainerOnlyDisabled}
          >
            <Select
              id="limitsMemorySwap"label="Memory swap (Containers only)"
              name="limits_memory_swap"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={booleanFields}
              value={formik.values.limits_memory_swap}
              disabled={isContainerOnlyDisabled}
            />
          </OverrideField>
          <hr />
          <OverrideField
            formik={formik}
            name="limits_disk_priority"
            label="Disk priority"
            defaultValue="true"
          >
            <Input
              id="limitsDiskPriority"label="Disk priority"
              name="limits_disk_priority"
              placeholder="Enter number"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.limits_disk_priority}
              type="number"
              help="Controls how much priority to give to the instance’s I/O requests when under load (integer between 0 and 10)"
            />
          </OverrideField>
          <hr />
          <OverrideField
            formik={formik}
            name="limits_processes"
            label="Max number of processes (Containers only)"
            defaultValue="true"
            disabled={isContainerOnlyDisabled}
          >
            <Input
              id="limitsProcesses"label="Max number of processes (Containers only)"
              name="limits_processes"
              placeholder="Enter number"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.limits_processes}
              type="number"
              disabled={isContainerOnlyDisabled}
              labelClassName={classnames({
                "is-disabled": isContainerOnlyDisabled,
              })}
            />
          </OverrideField>
        </Col>
      </Row>
    </>
  );
};

export default ResourceLimitsForm;
