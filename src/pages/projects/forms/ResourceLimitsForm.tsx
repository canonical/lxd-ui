import React, { FC } from "react";
import { Input } from "@canonical/react-components";
import { getConfigurationRow } from "pages/instances/forms/ConfigurationRow";
import ConfigurationTable from "pages/instances/forms/ConfigurationTable";
import { ProjectFormValues } from "pages/projects/CreateProjectForm";
import { FormikProps } from "formik/dist/types";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";
import DiskSizeSelector from "pages/projects/forms/DiskSizeSelector";
import { getProjectKey } from "util/projectConfigFields";

export interface ResourceLimitsFormValues {
  limits_instances?: number;
  limits_containers?: number;
  limits_virtual_machines?: number;
  limits_disk?: string;
  limits_networks?: number;
  limits_cpu?: number;
  limits_memory?: number;
  limits_processes?: number;
}

export const resourceLimitsPayload = (values: ProjectFormValues) => {
  return {
    [getProjectKey("limits_instances")]: values.limits_instances?.toString(),
    [getProjectKey("limits_containers")]: values.limits_containers?.toString(),
    [getProjectKey("limits_virtual_machines")]:
      values.limits_virtual_machines?.toString(),
    [getProjectKey("limits_disk")]: values.limits_disk?.toString(),
    [getProjectKey("limits_networks")]: values.limits_networks?.toString(),
    [getProjectKey("limits_cpu")]: values.limits_cpu?.toString(),
    [getProjectKey("limits_memory")]: values.limits_memory?.toString(),
    [getProjectKey("limits_processes")]: values.limits_processes?.toString(),
  };
};

interface Props {
  formik: FormikProps<ProjectFormValues>;
}

const ResourceLimitsForm: FC<Props> = ({ formik }) => {
  return (
    <ConfigurationTable
      formik={formik as unknown as SharedFormikTypes}
      rows={[
        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "limits_instances",
          label: "Max number of instances",
          defaultValue: "",
          children: (
            <Input
              placeholder="Enter number"
              min={0}
              type="number"
              help="Maximum number of total instances that can be created in the project"
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "limits_containers",
          label: "Max number of containers",
          defaultValue: "",
          children: (
            <Input
              placeholder="Enter number"
              min={0}
              type="number"
              help="Maximum number of containers that can be created in the project"
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "limits_virtual_machines",
          label: "Max number of VMs",
          defaultValue: "",
          children: (
            <Input
              placeholder="Enter number"
              min={0}
              type="number"
              help="Maximum number of VMs that can be created in the project"
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "limits_disk",
          label: "Max disk space (used by all instances)",
          defaultValue: "",
          children: (
            <DiskSizeSelector
              setMemoryLimit={(val?: string) =>
                formik.setFieldValue("limits_disk", val)
              }
              helpText="Maximum value of aggregate disk space used by all instances volumes, custom volumes and images of the project"
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "limits_networks",
          label: "Max number of networks",
          defaultValue: "",
          children: (
            <Input
              placeholder="Enter number"
              min={0}
              type="number"
              help="Maximum value for the number of networks this project can have"
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "limits_cpu",
          label: "Max sum of individual CPU configurations",
          defaultValue: "",
          children: (
            <Input
              placeholder="Enter number"
              min={0}
              type="number"
              help="Maximum value for the sum of individual limits.cpu configurations set on the instances of the project"
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "limits_memory",
          label: "Max sum of individual memory limits",
          defaultValue: "",
          children: (
            <Input
              placeholder="Enter number"
              min={0}
              type="number"
              help="Maximum value for the sum of individual limits.memory configurations set on the instances of the project"
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "limits_processes",
          label: "Max sum of individual processes configurations",
          defaultValue: "",
          children: (
            <Input
              placeholder="Enter number"
              min={0}
              type="number"
              help="Maximum value for the sum of individual limits.processes configurations set on the instances of the project"
            />
          ),
        }),
      ]}
    />
  );
};

export default ResourceLimitsForm;
