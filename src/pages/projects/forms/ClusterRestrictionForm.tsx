import React, { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { getConfigurationRow } from "pages/instances/forms/ConfigurationRow";
import ConfigurationTable from "pages/instances/forms/ConfigurationTable";
import { CreateProjectFormValues } from "pages/projects/CreateProjectForm";
import { FormikProps } from "formik/dist/types";
import { stringAllowBlock } from "util/projectOptions";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";

export interface ClusterRestrictionFormValues {
  restricted_cluster_groups?: string;
  restricted_cluster_target?: string;
}

export const clusterRestrictionPayload = (values: CreateProjectFormValues) => {
  return {
    ["restricted.cluster.groups"]: values.restricted_cluster_groups,
    ["restricted.cluster.target"]: values.restricted_cluster_target,
  };
};

interface Props {
  formik: FormikProps<CreateProjectFormValues>;
}

const ClusterRestrictionForm: FC<Props> = ({ formik }) => {
  return (
    <ConfigurationTable
      formik={formik as unknown as SharedFormikTypes}
      rows={[
        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_cluster_groups",
          label: "Cluster groups targeting",
          defaultValue: "",
          children: (
            <Input
              id="restricted_cluster_groups"
              name="restricted_cluster_groups"
              placeholder="Enter value"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.restricted_cluster_groups}
              type="text"
              help="Prevents targeting cluster groups other than the provided ones."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_cluster_target",
          label: "Direct cluster targeting",
          defaultValue: "",
          children: (
            <Select
              id="restricted_cluster_target"
              name="restricted_cluster_target"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={stringAllowBlock}
              value={formik.values.restricted_cluster_target}
              help="Prevents direct targeting of cluster members when creating or moving instances."
            />
          ),
        }),
      ]}
    />
  );
};

export default ClusterRestrictionForm;
