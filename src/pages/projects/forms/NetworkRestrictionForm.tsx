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
              id="restricted_network_access"
              name="restricted_network_access"
              placeholder="Enter network names"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.restricted_network_access}
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
              id="restricted_network_subnets"
              name="restricted_network_subnets"
              placeholder="Enter network subnets"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.restricted_network_subnets}
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
              id="restricted_network_uplinks"
              name="restricted_network_uplinks"
              placeholder="Enter network names"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.restricted_network_uplinks}
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
              id="restricted_network_zones"
              name="restricted_network_zones"
              placeholder="Enter network zones"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.restricted_network_zones}
              help="Comma-delimited list of network zones that can be used (or something under them) in this project."
            />
          ),
        }),
      ]}
    />
  );
};

export default NetworkRestrictionForm;
