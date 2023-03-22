import React, { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { CreateInstanceFormValues } from "pages/instances/CreateInstanceForm";
import classnames from "classnames";
import {
  booleanFieldsAllowDeny,
  booleanFieldsTrueFalse,
  booleanFieldsYesNo,
} from "util/instanceOptions";
import {
  SharedFormikTypes,
  SharedFormTypes,
} from "pages/instances/forms/sharedFormTypes";
import { getOverrideRow } from "pages/instances/forms/OverrideRow";
import OverrideTable from "pages/instances/forms/OverrideTable";

export interface SecurityPoliciesFormValues {
  security_protection_delete?: string;
  security_privileged?: string;
  security_protection_shift?: string;
  security_idmap_base?: string;
  security_idmap_size?: number;
  security_idmap_isolated?: string;
  security_devlxd?: string;
  security_devlxd_images?: string;
  security_secureboot?: string;
}

export const securityPoliciesPayload = (values: SharedFormTypes) => {
  return {
    ["security.protection.delete"]: values.security_protection_delete,
    ["security.privileged"]: values.security_privileged,
    ["security.protection.shift"]: values.security_protection_shift,
    ["security.idmap.base"]: values.security_idmap_base,
    ["security.idmap.size"]: values.security_idmap_size?.toString(),
    ["security.idmap.isolated"]: values.security_idmap_isolated,
    ["security.devlxd"]: values.security_devlxd,
    ["security.devlxd.images"]: values.security_devlxd_images,
    ["security.secureboot"]: values.security_secureboot,
  };
};

interface Props {
  formik: SharedFormikTypes;
}

const SecurityPoliciesForm: FC<Props> = ({ formik }) => {
  const isInstance = formik.values.type === "instance";
  const isContainerOnlyDisabled =
    isInstance &&
    (formik.values as CreateInstanceFormValues).instanceType !== "container";
  const isVmOnlyDisabled =
    isInstance &&
    (formik.values as CreateInstanceFormValues).instanceType !==
      "virtual-machine";

  return (
    <OverrideTable
      rows={[
        getOverrideRow({
          formik: formik,
          label: "Prevent the instance from being deleted",
          name: "security_protection_delete",
          defaultValue: "true",
          children: (
            <Select
              id="security_protection_delete"
              name="security_protection_delete"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={booleanFieldsYesNo}
              value={formik.values.security_protection_delete}
              autoFocus
            />
          ),
        }),
        getOverrideRow({
          formik: formik,
          label: "Run the instance in privileged mode (Containers only)",
          name: "security_privileged",
          defaultValue: "true",
          disabled: isContainerOnlyDisabled,
          children: (
            <Select
              id="security_privileged"
              name="security_privileged"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={booleanFieldsAllowDeny}
              value={formik.values.security_privileged}
              disabled={isContainerOnlyDisabled}
              autoFocus
            />
          ),
        }),
        getOverrideRow({
          formik: formik,
          label:
            "Prevent instance file system from being UID/GID shifted on startup (Containers only)",
          name: "security_protection_shift",
          defaultValue: "true",
          disabled: isContainerOnlyDisabled,
          children: (
            <Select
              id="security_protection_shift"
              name="security_protection_shift"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={booleanFieldsYesNo}
              value={formik.values.security_protection_shift}
              disabled={isContainerOnlyDisabled}
              autoFocus
            />
          ),
        }),
        getOverrideRow({
          formik: formik,
          label: "Base host id (Containers only)",
          name: "security_idmap_base",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          children: (
            <Input
              id="security_idmap_base"
              placeholder="Enter ID"
              name="security_idmap_base"
              type="text"
              value={formik.values.security_idmap_base}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              disabled={isContainerOnlyDisabled}
              labelClassName={classnames({
                "is-disabled": isContainerOnlyDisabled,
              })}
              autoFocus
            />
          ),
        }),
        getOverrideRow({
          formik: formik,
          label: "Idmap size (Containers only)",
          name: "security_idmap_size",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          children: (
            <Input
              id="security_idmap_size"
              placeholder="Enter number"
              name="security_idmap_size"
              type="number"
              min={0}
              value={formik.values.security_idmap_size}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              disabled={isContainerOnlyDisabled}
              labelClassName={classnames({
                "is-disabled": isContainerOnlyDisabled,
              })}
              autoFocus
            />
          ),
        }),
        getOverrideRow({
          formik: formik,
          label: "Use unique idmap (Containers only)",
          name: "security_idmap_isolated",
          defaultValue: "true",
          disabled: isContainerOnlyDisabled,
          children: (
            <Select
              id="security_idmap_isolated"
              name="security_idmap_isolated"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={booleanFieldsTrueFalse}
              value={formik.values.security_idmap_isolated}
              disabled={isContainerOnlyDisabled}
              autoFocus
            />
          ),
        }),
        getOverrideRow({
          formik: formik,
          label: "Allow /dev/lxd in the instance (Containers only)",
          name: "security_devlxd",
          defaultValue: "true",
          disabled: isContainerOnlyDisabled,
          children: (
            <Select
              id="security_devlxd"
              name="security_devlxd"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={booleanFieldsYesNo}
              value={formik.values.security_devlxd}
              disabled={isContainerOnlyDisabled}
              autoFocus
            />
          ),
        }),
        getOverrideRow({
          formik: formik,
          label:
            "Make /1.0/images API available over /dev/lxd (Containers only)",
          name: "security_devlxd_images",
          defaultValue: "true",
          disabled: isContainerOnlyDisabled,
          children: (
            <Select
              id="security_devlxd_images"
              name="security_devlxd_images"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={booleanFieldsYesNo}
              value={formik.values.security_devlxd_images}
              disabled={
                !formik.values.security_devlxd || isContainerOnlyDisabled
              }
              autoFocus
            />
          ),
        }),
        getOverrideRow({
          formik: formik,
          label: "Enable secureboot (VMs only)",
          name: "security_secureboot",
          defaultValue: "true",
          disabled: isVmOnlyDisabled,
          children: (
            <Select
              id="security_secureboot"
              name="security_secureboot"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={booleanFieldsTrueFalse}
              value={formik.values.security_secureboot}
              disabled={isVmOnlyDisabled}
              autoFocus
            />
          ),
        }),
      ]}
    />
  );
};

export default SecurityPoliciesForm;
