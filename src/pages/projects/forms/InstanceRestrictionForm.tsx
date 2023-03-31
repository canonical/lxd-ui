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
    ["restricted.virtual-machines.lowlevel"]:
      values.restricted_virtual_machines_low_level,
    ["restricted.containers.lowlevel"]: values.restricted_containers_low_level,
    ["restricted.containers.nesting"]: values.restricted_containers_nesting,
    ["restricted.containers.privilege"]: values.restricted_containers_privilege,
    ["restricted.containers.interception"]:
      values.restricted_container_interception,
    ["restricted.snapshots"]: values.restrict_snapshots,
    ["restricted.idmap.uid"]: values.restricted_idmap_uid,
    ["restricted.idmap.gid"]: values.restricted_idmap_gid,
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
              help="Prevents use of low-level virtual-machine options like raw.qemu, volatile etc."
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
              help="Prevents use of low-level container options like raw.lxc, raw.idmap, volatile etc."
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
              help="Prevents setting security.nesting=true."
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
              help="Prevents use for system call interception options. When set to allow usually safe interception options will be allowed (file system mounting will remain blocked)."
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
              help="Prevents the creation of any instance or volume snapshots."
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
              help="Specifies the allowed host UID ranges allowed in the instance raw.idmap setting."
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
              help="Specifies the allowed host GID ranges allowed in the instance raw.idmap setting."
            />
          ),
        }),
      ]}
    />
  );
};

export default InstanceRestrictionForm;
