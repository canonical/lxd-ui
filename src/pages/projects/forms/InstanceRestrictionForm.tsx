import { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { ProjectFormValues } from "pages/projects/CreateProject";
import { FormikProps } from "formik/dist/types";
import {
  optionAllowBlock,
  optionAllowIsolatedUnprivileged,
} from "util/projectOptions";
import { optionRenderer } from "util/formFields";
import { getProjectKey } from "util/projectConfigFields";

export interface InstanceRestrictionFormValues {
  restricted_virtual_machines_low_level?: string;
  restricted_containers_low_level?: string;
  restricted_containers_nesting?: string;
  restricted_containers_privilege?: string;
  restricted_container_interception?: string;
  restrict_snapshots?: string;
  restricted_idmap_uid?: string;
  restricted_idmap_gid?: string;
}

export const instanceRestrictionPayload = (values: ProjectFormValues) => {
  return {
    [getProjectKey("restricted_virtual_machines_low_level")]:
      values.restricted_virtual_machines_low_level,
    [getProjectKey("restricted_containers_low_level")]:
      values.restricted_containers_low_level,
    [getProjectKey("restricted_containers_nesting")]:
      values.restricted_containers_nesting,
    [getProjectKey("restricted_containers_privilege")]:
      values.restricted_containers_privilege,
    [getProjectKey("restricted_container_interception")]:
      values.restricted_container_interception,
    [getProjectKey("restrict_snapshots")]: values.restrict_snapshots,
    [getProjectKey("restricted_idmap_uid")]: values.restricted_idmap_uid,
    [getProjectKey("restricted_idmap_gid")]: values.restricted_idmap_gid,
  };
};

interface Props {
  formik: FormikProps<ProjectFormValues>;
}

const InstanceRestrictionForm: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          name: "restricted_virtual_machines_low_level",
          label: "Low level VM operations",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_containers_low_level",
          label: "Low level container operations",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_containers_nesting",
          label: "Container nesting",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_containers_privilege",
          label: "Container privilege",
          defaultValue: "",
          readOnlyRenderer: (val) =>
            optionRenderer(val, optionAllowIsolatedUnprivileged),
          children: <Select options={optionAllowIsolatedUnprivileged} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_container_interception",
          label: "Container interception",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restrict_snapshots",
          label: "Snapshot creation",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_idmap_uid",
          label: "Idmap UID",
          defaultValue: "",
          children: <Input placeholder="Enter UID ranges" type="text" />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_idmap_gid",
          label: "Idmap GID",
          defaultValue: "",
          children: <Input placeholder="Enter GID ranges" type="text" />,
        }),
      ]}
    />
  );
};

export default InstanceRestrictionForm;
