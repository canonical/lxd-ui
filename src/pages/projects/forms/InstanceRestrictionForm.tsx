import React, { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { getConfigurationRow } from "pages/instances/forms/ConfigurationRow";
import ConfigurationTable from "pages/instances/forms/ConfigurationTable";
import { ProjectFormValues } from "pages/projects/CreateProjectForm";
import { FormikProps } from "formik/dist/types";
import {
  optionAllowBlock,
  optionAllowIsolatedUnprivileged,
} from "util/projectOptions";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";
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
    <ConfigurationTable
      formik={formik as unknown as SharedFormikTypes}
      rows={[
        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_virtual_machines_low_level",
          label: "Low level VM operations",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: (
            <Select
              options={optionAllowBlock}
              help="Use of low-level virtual-machine options like raw.qemu, volatile etc."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_containers_low_level",
          label: "Low level container operations",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: (
            <Select
              options={optionAllowBlock}
              help="Use of low-level container options like raw.lxc, raw.idmap, volatile etc."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_containers_nesting",
          label: "Container nesting",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: (
            <Select
              options={optionAllowBlock}
              help="Setting security.nesting=true."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_containers_privilege",
          label: "Container privilege",
          defaultValue: "",
          readOnlyRenderer: (val) =>
            optionRenderer(val, optionAllowIsolatedUnprivileged),
          children: (
            <Select
              options={optionAllowIsolatedUnprivileged}
              help="If unpriviliged, prevents setting security.privileged=true. If isolated, prevents setting security.privileged=true and also security.idmap.isolated=true. If allow, no restriction apply."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_container_interception",
          label: "Container interception",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: (
            <Select
              options={optionAllowBlock}
              help="Use for system call interception options. When set to allow usually safe interception options will be allowed (file system mounting will remain blocked)."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restrict_snapshots",
          label: "Snapshot creation",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: (
            <Select
              options={optionAllowBlock}
              help="Creation of instance or volume snapshots."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_idmap_uid",
          label: "Idmap UID",
          defaultValue: "",
          children: (
            <Input
              placeholder="Enter UID ranges"
              type="text"
              help="Specifies the allowed host UID ranges in the instance raw.idmap setting."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_idmap_gid",
          label: "Idmap GID",
          defaultValue: "",
          children: (
            <Input
              placeholder="Enter GID ranges"
              type="text"
              help="Specifies the allowed host GID ranges in the instance raw.idmap setting."
            />
          ),
        }),
      ]}
    />
  );
};

export default InstanceRestrictionForm;
