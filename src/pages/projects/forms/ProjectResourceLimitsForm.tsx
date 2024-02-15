import { FC } from "react";
import { Input } from "@canonical/react-components";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { ProjectFormValues } from "pages/projects/CreateProject";
import { FormikProps } from "formik/dist/types";
import DiskSizeSelector from "components/forms/DiskSizeSelector";
import { getProjectKey } from "util/projectConfigFields";

export interface ProjectResourceLimitsFormValues {
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

const ProjectResourceLimitsForm: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          name: "limits_instances",
          label: "Max number of instances",
          defaultValue: "",
          children: <Input placeholder="Enter number" min={0} type="number" />,
        }),

        getConfigurationRow({
          formik,
          name: "limits_containers",
          label: "Max number of containers",
          defaultValue: "",
          children: <Input placeholder="Enter number" min={0} type="number" />,
        }),

        getConfigurationRow({
          formik,
          name: "limits_virtual_machines",
          label: "Max number of VMs",
          defaultValue: "",
          children: <Input placeholder="Enter number" min={0} type="number" />,
        }),

        getConfigurationRow({
          formik,
          name: "limits_disk",
          label: "Max disk space (used by all instances)",
          defaultValue: "",
          children: (
            <DiskSizeSelector
              setMemoryLimit={(val?: string) =>
                void formik.setFieldValue("limits_disk", val)
              }
            />
          ),
        }),

        getConfigurationRow({
          formik,
          name: "limits_networks",
          label: "Max number of networks",
          defaultValue: "",
          children: <Input placeholder="Enter number" min={0} type="number" />,
        }),

        getConfigurationRow({
          formik,
          name: "limits_cpu",
          label: "Max sum of CPU",
          defaultValue: "",
          children: <Input placeholder="Enter number" min={0} type="number" />,
        }),

        getConfigurationRow({
          formik,
          name: "limits_memory",
          label: "Max sum of memory limits",
          defaultValue: "",
          children: <Input placeholder="Enter number" min={0} type="number" />,
        }),

        getConfigurationRow({
          formik,
          name: "limits_processes",
          label: "Max sum of processes",
          defaultValue: "-",
          children: <Input placeholder="Enter number" min={0} type="number" />,
        }),
      ]}
    />
  );
};

export default ProjectResourceLimitsForm;
