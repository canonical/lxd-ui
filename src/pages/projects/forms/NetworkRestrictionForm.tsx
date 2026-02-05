import type { FC } from "react";
import { Textarea } from "@canonical/react-components";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import type { ProjectFormValues } from "types/forms/project";
import type { FormikProps } from "formik/dist/types";
import { getProjectKey } from "util/projectConfigFields";
import type { LxdConfigPair } from "types/config";
import type { NetworkRestrictionFormValues } from "types/forms/project";

export const networkRestrictionPayload = (
  values: NetworkRestrictionFormValues,
): LxdConfigPair => {
  return {
    [getProjectKey("restricted_network_access")]:
      values.restricted_network_access,
    [getProjectKey("restricted_network_subnets")]:
      values.restricted_network_subnets,
    [getProjectKey("restricted_network_uplinks")]:
      values.restricted_network_uplinks,
    [getProjectKey("restricted_network_zones")]:
      values.restricted_network_zones,
  };
};

interface Props {
  formik: FormikProps<ProjectFormValues>;
}

const NetworkRestrictionForm: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          name: "restricted_network_access",
          label: "Available networks",
          defaultValue: "",
          children: <Textarea placeholder="Enter network names" />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_network_subnets",
          label: "Network subnets",
          defaultValue: "",
          children: <Textarea placeholder="Enter network subnets" />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_network_uplinks",
          label: "Network uplinks",
          defaultValue: "",
          children: <Textarea placeholder="Enter network names" />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_network_zones",
          label: "Network zones",
          defaultValue: "",
          children: <Textarea placeholder="Enter network zones" />,
        }),
      ]}
    />
  );
};

export default NetworkRestrictionForm;
