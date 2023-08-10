import React, { FC } from "react";
import { Textarea } from "@canonical/react-components";
import { getConfigurationRow } from "pages/instances/forms/ConfigurationRow";
import ConfigurationTable from "pages/instances/forms/ConfigurationTable";
import { ProjectFormValues } from "pages/projects/CreateProjectForm";
import { FormikProps } from "formik/dist/types";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";
import { getProjectKey } from "util/projectConfigFields";

export interface NetworkRestrictionFormValues {
  restricted_network_access?: string;
  restricted_network_subnets?: string;
  restricted_network_uplinks?: string;
  restricted_network_zones?: string;
}

export const networkRestrictionPayload = (
  values: NetworkRestrictionFormValues
) => {
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
    <ConfigurationTable
      rows={[
        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_network_access",
          label: "Available networks",
          help: "Comma-delimited list of network names that are allowed for use in this project. If not set, all networks are accessible (depending on the restricted.devices.nic setting).",
          defaultValue: "",
          children: <Textarea placeholder="Enter network names" />,
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_network_subnets",
          label: "Network subnets",
          help: "Comma-delimited list of network subnets from the uplink networks (in the form <uplink>:<subnet>) that are allocated for use in this project.",
          defaultValue: "",
          children: <Textarea placeholder="Enter network subnets" />,
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_network_uplinks",
          label: "Network uplinks",
          help: "Comma-delimited list of network names that can be used as uplink for networks in this project.",
          defaultValue: "",
          children: <Textarea placeholder="Enter network names" />,
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_network_zones",
          label: "Network zones",
          help: "Comma-delimited list of network zones that can be used (or something under them) in this project.",
          defaultValue: "",
          children: <Textarea placeholder="Enter network zones" />,
        }),
      ]}
    />
  );
};

export default NetworkRestrictionForm;
