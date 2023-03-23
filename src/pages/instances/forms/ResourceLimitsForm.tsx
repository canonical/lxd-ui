import React, { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { CreateInstanceFormValues } from "pages/instances/CreateInstanceForm";
import MemoryLimitSelector from "./MemoryLimitSelector";
import CpuLimitSelector from "./CpuLimitSelector";
import { CpuLimit, MemoryLimit } from "types/limits";
import { cpuLimitToPayload, memoryLimitToPayload } from "util/limits";
import { booleanFieldsAllowDeny, diskPriorities } from "util/instanceOptions";
import {
  SharedFormikTypes,
  SharedFormTypes,
} from "pages/instances/forms/sharedFormTypes";
import { DEFAULT_CPU_LIMIT, DEFAULT_MEM_LIMIT } from "util/defaults";
import { getConfigurationRow } from "pages/instances/forms/ConfigurationRow";
import ConfigurationTable from "pages/instances/forms/ConfigurationTable";

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
    <ConfigurationTable
      formik={formik}
      rows={[
        getConfigurationRow({
          formik: formik,
          name: "limits_cpu",
          label: "Exposed CPUs",
          defaultValue: DEFAULT_CPU_LIMIT,
          readOnlyValue: formik.values.limits_cpu
            ? cpuLimitToPayload(formik.values.limits_cpu)
            : undefined,
          children: (
            <CpuLimitSelector
              cpuLimit={formik.values.limits_cpu}
              setCpuLimit={(cpuLimit) => {
                formik.setFieldValue("limits_cpu", cpuLimit);
              }}
            />
          ),
        }),

        getConfigurationRow({
          formik: formik,
          name: "limits_memory",
          label: "Memory limit",
          defaultValue: DEFAULT_MEM_LIMIT,
          readOnlyValue: formik.values.limits_memory
            ? memoryLimitToPayload(formik.values.limits_memory)
            : undefined,
          children: (
            <MemoryLimitSelector
              memoryLimit={formik.values.limits_memory}
              setMemoryLimit={(memoryLimit) =>
                formik.setFieldValue("limits_memory", memoryLimit)
              }
            />
          ),
        }),

        getConfigurationRow({
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
              options={booleanFieldsAllowDeny}
              value={formik.values.limits_memory_swap}
              disabled={isContainerOnlyDisabled}
            />
          ),
        }),

        getConfigurationRow({
          formik: formik,
          name: "limits_disk_priority",
          label: "Disk priority",
          defaultValue: "",
          children: (
            <Select
              id="limits_disk_priority"
              name="limits_disk_priority"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={diskPriorities}
              value={formik.values.limits_disk_priority}
              help="Controls how much priority to give to the instance’s I/O requests when under load"
            />
          ),
        }),

        getConfigurationRow({
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
              min={0}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.limits_processes}
              type="number"
              disabled={isContainerOnlyDisabled}
            />
          ),
        }),
      ]}
    />
  );
};

export default ResourceLimitsForm;
