import React, { FC } from "react";
import { Input, Textarea } from "@canonical/react-components";
import { getConfigurationRow } from "pages/instances/forms/ConfigurationRow";
import ConfigurationTable from "pages/instances/forms/ConfigurationTable";
import { ProjectFormValues } from "pages/projects/CreateProjectForm";
import { FormikProps } from "formik/dist/types";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";

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
    ["restricted.networks.access"]: values.restricted_network_access,
    ["restricted.networks.subnets"]: values.restricted_network_subnets,
    ["restricted.networks.uplinks"]: values.restricted_network_uplinks,
    ["restricted.networks.zones"]: values.restricted_network_zones,
  };
};

interface Props {
  formik: FormikProps<ProjectFormValues>;
}

const NetworkRestrictionForm: FC<Props> = ({ formik }) => {
  return (
    <ConfigurationTable
      formik={formik as unknown as SharedFormikTypes}
      rows={[
        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_network_access",
          label: "Available networks",
          defaultValue: "",
          children: (
            <Input
              placeholder="Enter network names"
              type="text"
              help="Comma-delimited list of network names that are allowed for use in this project. If not set, all networks are accessible (depending on the restricted.devices.nic setting)."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_network_subnets",
          label: "Network subnets",
          defaultValue: "",
          children: (
            <Textarea
              placeholder="Enter network subnets"
              help="Comma-delimited list of network subnets from the uplink networks (in the form <uplink>:<subnet>) that are allocated for use in this project."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_network_uplinks",
          label: "Network uplinks",
          defaultValue: "",
          children: (
            <Textarea
              placeholder="Enter network names"
              help="Comma-delimited list of network names that can be used as uplink for networks in this project."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_network_zones",
          label: "Network zones",
          defaultValue: "",
          children: (
            <Textarea
              placeholder="Enter network zones"
              help="Comma-delimited list of network zones that can be used (or something under them) in this project."
            />
          ),
        }),
      ]}
    />
  );
};

export default NetworkRestrictionForm;
