import React, { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { getInstanceConfigurationRow } from "pages/instances/forms/InstanceConfigurationRow";
import InstanceConfigurationTable from "pages/instances/forms/InstanceConfigurationTable";
import { ProjectFormValues } from "pages/projects/CreateProjectForm";
import { FormikProps } from "formik/dist/types";
import { optionAllowBlock } from "util/projectOptions";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";
import { optionRenderer } from "util/formFields";
import { getProjectKey } from "util/projectConfigFields";

export interface ClusterRestrictionFormValues {
  restricted_cluster_groups?: string;
  restricted_cluster_target?: string;
}

export const clusterRestrictionPayload = (values: ProjectFormValues) => {
  return {
    [getProjectKey("restricted_cluster_groups")]:
      values.restricted_cluster_groups,
    [getProjectKey("restricted_cluster_target")]:
      values.restricted_cluster_target,
  };
};

interface Props {
  formik: FormikProps<ProjectFormValues>;
}

const ClusterRestrictionForm: FC<Props> = ({ formik }) => {
  return (
    <InstanceConfigurationTable
      rows={[
        getInstanceConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_cluster_groups",
          label: "Cluster groups targeting",
          help: "Prevents targeting cluster groups other than the provided ones.",
          defaultValue: "",
          children: <Input placeholder="Enter value" type="text" />,
        }),

        getInstanceConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_cluster_target",
          label: "Direct cluster targeting",
          help: "Direct targeting of cluster members when creating or moving instances.",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),
      ]}
    />
  );
};

export default ClusterRestrictionForm;
