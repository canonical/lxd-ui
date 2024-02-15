import { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import MemoryLimitSelector from "./MemoryLimitSelector";
import CpuLimitSelector from "./CpuLimitSelector";
import { CpuLimit, MemoryLimit } from "types/limits";
import { cpuLimitToPayload, memoryLimitToPayload } from "util/limits";
import { optionAllowDeny, diskPriorities } from "util/instanceOptions";
import {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { DEFAULT_CPU_LIMIT, DEFAULT_MEM_LIMIT } from "util/defaults";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceKey } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";

export interface ResourceLimitsFormValues {
  limits_cpu?: CpuLimit;
  limits_memory?: MemoryLimit;
  limits_memory_swap?: string;
  limits_disk_priority?: number;
  limits_processes?: number;
}

export const resourceLimitsPayload = (values: InstanceAndProfileFormValues) => {
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
  formik: InstanceAndProfileFormikProps;
}

const ResourceLimitsForm: FC<Props> = ({ formik }) => {
  const isInstance = formik.values.entityType === "instance";
  const isContainerOnlyDisabled =
    isInstance &&
    (formik.values as CreateInstanceFormValues).instanceType !== "container";

  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
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

        getConfigurationRow({
          formik,
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

        getConfigurationRow({
          formik,
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

        getConfigurationRow({
          formik,
          name: "limits_disk_priority",
          label: "Disk priority",
          defaultValue: "",
          children: <Select options={diskPriorities} />,
        }),

        getConfigurationRow({
          formik,
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
