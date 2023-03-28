import React, { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { getConfigurationRow } from "pages/instances/forms/ConfigurationRow";
import ConfigurationTable from "pages/instances/forms/ConfigurationTable";
import { CreateProjectFormValues } from "pages/projects/CreateProjectForm";
import { FormikProps } from "formik/dist/types";
import {
  stringAllowBlock,
  stringUnprivilegedIsolatedAllow,
} from "util/projectOptions";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";

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

export const instanceRestrictionPayload = (values: CreateProjectFormValues) => {
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
  formik: FormikProps<CreateProjectFormValues>;
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
          children: (
            <Select
              id="restricted_virtual_machines_low_level"
              name="restricted_virtual_machines_low_level"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={stringAllowBlock}
              value={formik.values.restricted_virtual_machines_low_level}
              help="Prevents use of low-level virtual-machine options like raw.qemu, volatile etc."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_containers_low_level",
          label: "Low level container operations",
          defaultValue: "",
          children: (
            <Select
              id="restricted_containers_low_level"
              name="restricted_containers_low_level"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={stringAllowBlock}
              value={formik.values.restricted_containers_low_level}
              help="Prevents use of low-level container options like raw.lxc, raw.idmap, volatile etc."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_containers_nesting",
          label: "Container nesting",
          defaultValue: "",
          children: (
            <Select
              id="restricted_containers_nesting"
              name="restricted_containers_nesting"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={stringAllowBlock}
              value={formik.values.restricted_containers_nesting}
              help="Prevents setting security.nesting=true."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_containers_privilege",
          label: "Container privilege",
          defaultValue: "",
          children: (
            <Select
              id="restricted_containers_privilege"
              name="restricted_containers_privilege"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={stringUnprivilegedIsolatedAllow}
              value={formik.values.restricted_containers_privilege}
              help="If unpriviliged, prevents setting security.privileged=true. If isolated, prevents setting security.privileged=true and also security.idmap.isolated=true. If allow, no restriction apply."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_container_interception",
          label: "Container interception",
          defaultValue: "",
          children: (
            <Select
              id="restricted_container_interception"
              name="restricted_container_interception"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={stringAllowBlock}
              value={formik.values.restricted_container_interception}
              help="Prevents use for system call interception options. When set to allow usually safe interception options will be allowed (file system mounting will remain blocked)."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restrict_snapshots",
          label: "Snapshot creation",
          defaultValue: "",
          children: (
            <Select
              id="restrict_snapshots"
              name="restrict_snapshots"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={stringAllowBlock}
              value={formik.values.restrict_snapshots}
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
              id="restricted_idmap_uid"
              name="restricted_idmap_uid"
              placeholder="Enter UID ranges"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.restricted_idmap_uid}
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
              id="restricted_idmap_gid"
              name="restricted_idmap_gid"
              placeholder="Enter GID ranges"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.restricted_idmap_gid}
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
