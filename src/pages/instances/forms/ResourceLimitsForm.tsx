import React, { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { CreateInstanceFormValues } from "pages/instances/CreateInstanceForm";
import MemoryLimitSelector from "./MemoryLimitSelector";
import CpuLimitSelector from "./CpuLimitSelector";
import { CpuLimit, MemoryLimit } from "types/limits";
import { cpuLimitToPayload, memoryLimitToPayload } from "util/limits";
import { booleanFields } from "util/instanceOptions";
import {
  SharedFormikTypes,
  SharedFormTypes,
} from "pages/instances/forms/sharedFormTypes";
import { DEFAULT_CPU_LIMIT, DEFAULT_MEM_LIMIT } from "util/defaults";
import { getOverrideRow } from "pages/instances/forms/OverrideRow";
import OverrideTable from "pages/instances/forms/OverrideTable";

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
}

const ResourceLimitsForm: FC<Props> = ({ formik }) => {
  const isInstance = formik.values.type === "instance";
  const isContainerOnlyDisabled =
    isInstance &&
    (formik.values as CreateInstanceFormValues).instanceType !== "container";

  return (
    <OverrideTable
      rows={[
        getOverrideRow({
          formik: formik,
          name: "limits_cpu",
          label: "Exposed CPUs",
          defaultValue: DEFAULT_CPU_LIMIT,
          children: (
            <CpuLimitSelector
              cpuLimit={formik.values.limits_cpu}
              setCpuLimit={(cpuLimit) => {
                formik.setFieldValue("limits_cpu", cpuLimit);
              }}
            />
          ),
        }),

        getOverrideRow({
          formik: formik,
          name: "limits_memory",
          label: "Memory limit",
          defaultValue: DEFAULT_MEM_LIMIT,
          children: (
            <MemoryLimitSelector
              memoryLimit={formik.values.limits_memory}
              setMemoryLimit={(memoryLimit) =>
                formik.setFieldValue("limits_memory", memoryLimit)
              }
            />
          ),
        }),

        getOverrideRow({
          formik: formik,
          name: "limits_memory_swap",
          label: "Memory swap (Containers only)",
          defaultValue: "true",
          disabled: isContainerOnlyDisabled,
          children: (
            <Select
              id="limits_memory_swap"
              name="limits_memory_swap"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={booleanFields}
              value={formik.values.limits_memory_swap}
              disabled={isContainerOnlyDisabled}
              autoFocus
            />
          ),
        }),

        getOverrideRow({
          formik: formik,
          name: "limits_disk_priority",
          label: "Disk priority",
          defaultValue: "",
          children: (
            <Input
              id="limits_disk_priority"
              name="limits_disk_priority"
              placeholder="Enter number"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.limits_disk_priority}
              type="number"
              help="Controls how much priority to give to the instance’s I/O requests when under load (integer between 0 and 10)"
              autoFocus
            />
          ),
        }),

        getOverrideRow({
          formik: formik,
          name: "limits_processes",
          label: "Max number of processes (Containers only)",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          children: (
            <Input
              id="limits_processes"
              name="limits_processes"
              placeholder="Enter number"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.limits_processes}
              type="number"
              disabled={isContainerOnlyDisabled}
              autoFocus
            />
          ),
        }),
      ]}
    />
  );
};

export default ResourceLimitsForm;
