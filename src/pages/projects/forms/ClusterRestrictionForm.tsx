import type { FC, ReactNode } from "react";
import { Select } from "@canonical/react-components";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import type { ProjectFormValues } from "pages/projects/CreateProject";
import type { FormikProps } from "formik/dist/types";
import { optionAllowBlock } from "util/projectOptions";
import { optionRenderer } from "util/formFields";
import { getProjectKey } from "util/projectConfigFields";
import type { LxdConfigPair } from "types/config";
import ResourceLink from "components/ResourceLink";
import ClusterGroupSelector from "pages/cluster/ClusterGroupSelector";
import { ROOT_PATH } from "util/rootPath";

export interface ClusterRestrictionFormValues {
  restricted_cluster_groups?: string;
  restricted_cluster_target?: string;
}

export const clusterRestrictionPayload = (
  values: ProjectFormValues,
): LxdConfigPair => {
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
          children: <ClusterGroupSelector formik={formik} />,
          readOnlyRenderer: (val): ReactNode => {
            if (val === "-" || typeof val !== "string") {
              return val;
            }

            const groups = val.split(",").filter(Boolean);
            return (
              <span className="restricted-cluster-groups">
                {groups?.map((group) => (
                  <ResourceLink
                    key={group}
                    type="cluster-group"
                    value={group}
                    to={`${ROOT_PATH}/ui/cluster/groups`}
                  />
                ))}
              </span>
            );
          },
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
