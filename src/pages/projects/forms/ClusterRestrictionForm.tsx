import { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { ProjectFormValues } from "pages/projects/CreateProject";
import { FormikProps } from "formik/dist/types";
import { optionAllowBlock } from "util/projectOptions";
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
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          name: "restricted_cluster_groups",
          label: "Cluster groups targeting",
          defaultValue: "",
          children: <Input placeholder="Enter value" type="text" />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_cluster_target",
          label: "Direct cluster targeting",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),
      ]}
    />
  );
};

export default ClusterRestrictionForm;
