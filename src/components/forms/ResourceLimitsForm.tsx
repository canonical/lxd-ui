import type { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import type {
  CreateInstanceFormValues,
  ResourceLimitsFormValues,
} from "types/forms/instanceAndProfile";
import MemoryLimitSelector from "./MemoryLimitSelector";
import CpuLimitSelector from "./CpuLimitSelector";
import type { CpuLimit, MemoryLimit } from "types/limits";
import { cpuLimitToPayload, memoryLimitToPayload } from "util/limits";
import { optionAllowDeny, diskPriorities } from "util/instanceOptions";
import type { InstanceAndProfileFormikProps } from "../../types/forms/instanceAndProfileFormProps";
import { DEFAULT_CPU_LIMIT, DEFAULT_MEM_LIMIT } from "util/defaults";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceField } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";

export const resourceLimitsPayload = (values: ResourceLimitsFormValues) => {
  return {
    [getInstanceField("limits_cpu")]: cpuLimitToPayload(values.limits_cpu),
    [getInstanceField("limits_memory")]: memoryLimitToPayload(
      values.limits_memory,
    ),
    [getInstanceField("limits_memory_swap")]: values.limits_memory_swap,
    [getInstanceField("limits_disk_priority")]:
      values.limits_disk_priority?.toString(),
    [getInstanceField("limits_processes")]: values.limits_processes?.toString(),
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
              formik={formik}
              cpuLimit={formik.values.limits_cpu}
              setCpuLimit={(cpuLimit) => {
                formik.setFieldValue("limits_cpu", cpuLimit);
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
              formik={formik}
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
          disabledReason: isContainerOnlyDisabled
            ? "Only available for containers"
            : undefined,
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
          disabledReason: isContainerOnlyDisabled
            ? "Only available for containers"
            : undefined,
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
