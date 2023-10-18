import React, { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { CreateInstanceFormValues } from "pages/instances/CreateInstanceForm";
import MemoryLimitSelector from "./MemoryLimitSelector";
import CpuLimitSelector from "./CpuLimitSelector";
import { CpuLimit, MemoryLimit } from "types/limits";
import { cpuLimitToPayload, memoryLimitToPayload } from "util/limits";
import { optionAllowDeny, diskPriorities } from "util/instanceOptions";
import { SharedFormikTypes, SharedFormTypes } from "./sharedFormTypes";
import { DEFAULT_CPU_LIMIT, DEFAULT_MEM_LIMIT } from "util/defaults";
import { getInstanceConfigurationRow } from "components/forms/InstanceConfigurationRow";
import InstanceConfigurationTable from "components/forms/InstanceConfigurationTable";
import { getInstanceKey } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";

export interface ResourceLimitsFormValues {
  limits_cpu?: CpuLimit;
  limits_memory?: MemoryLimit;
  limits_memory_swap?: string;
  limits_disk_priority?: number;
  limits_processes?: number;
}

export const resourceLimitsPayload = (values: SharedFormTypes) => {
  return {
    [getInstanceKey("limits_cpu")]: cpuLimitToPayload(values.limits_cpu),
    [getInstanceKey("limits_memory")]: memoryLimitToPayload(
      values.limits_memory,
    ),
    [getInstanceKey("limits_memory_swap")]: values.limits_memory_swap,
    [getInstanceKey("limits_disk_priority")]:
      values.limits_disk_priority?.toString(),
    [getInstanceKey("limits_processes")]: values.limits_processes?.toString(),
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
    <InstanceConfigurationTable
      rows={[
        getInstanceConfigurationRow({
          formik: formik,
          name: "limits_cpu",
          label: "Exposed CPU limit",
          defaultValue: DEFAULT_CPU_LIMIT,
          readOnlyRenderer: (val) =>
            cpuLimitToPayload(val as CpuLimit | string | undefined),
          children: (
            <CpuLimitSelector
              cpuLimit={formik.values.limits_cpu}
              setCpuLimit={(cpuLimit) => {
                void formik.setFieldValue("limits_cpu", cpuLimit);
              }}
            />
          ),
        }),

        getInstanceConfigurationRow({
          formik: formik,
          name: "limits_memory",
          label: "Memory limit",
          defaultValue: DEFAULT_MEM_LIMIT,
          readOnlyRenderer: (val) =>
            memoryLimitToPayload(val as MemoryLimit | undefined) ?? "",
          children: (
            <MemoryLimitSelector
              memoryLimit={formik.values.limits_memory}
              setMemoryLimit={(memoryLimit) =>
                void formik.setFieldValue("limits_memory", memoryLimit)
              }
            />
          ),
        }),

        getInstanceConfigurationRow({
          formik: formik,
          name: "limits_memory_swap",
          label: "Memory swap (Containers only)",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowDeny),
          children: (
            <Select
              options={optionAllowDeny}
              disabled={isContainerOnlyDisabled}
            />
          ),
        }),

        getInstanceConfigurationRow({
          formik: formik,
          name: "limits_disk_priority",
          help: "Controls how much priority to give to the instance’s I/O requests when under load",
          label: "Disk priority",
          defaultValue: "",
          children: <Select options={diskPriorities} />,
        }),

        getInstanceConfigurationRow({
          formik: formik,
          name: "limits_processes",
          label: "Max number of processes (Containers only)",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          children: (
            <Input
              placeholder="Enter number"
              min={1}
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
