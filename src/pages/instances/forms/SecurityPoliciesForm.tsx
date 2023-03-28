import React, { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { CreateInstanceFormValues } from "pages/instances/CreateInstanceForm";
import classnames from "classnames";
import {
  optionAllowDeny,
  optionTrueFalse,
  optionYesNo,
} from "util/instanceOptions";
import {
  SharedFormikTypes,
  SharedFormTypes,
} from "pages/instances/forms/sharedFormTypes";
import { getConfigurationRow } from "pages/instances/forms/ConfigurationRow";
import ConfigurationTable from "pages/instances/forms/ConfigurationTable";
import { optionRenderer, getPayloadKey } from "util/formFields";

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
    [getPayloadKey("security_protection_delete")]:
      values.security_protection_delete,
    [getPayloadKey("security_privileged")]: values.security_privileged,
    [getPayloadKey("security_protection_shift")]:
      values.security_protection_shift,
    [getPayloadKey("security_idmap_base")]: values.security_idmap_base,
    [getPayloadKey("security_idmap_size")]:
      values.security_idmap_size?.toString(),
    [getPayloadKey("security_idmap_isolated")]: values.security_idmap_isolated,
    [getPayloadKey("security_devlxd")]: values.security_devlxd,
    [getPayloadKey("security_devlxd_images")]: values.security_devlxd_images,
    [getPayloadKey("security_secureboot")]: values.security_secureboot,
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
    <ConfigurationTable
      formik={formik}
      rows={[
        getConfigurationRow({
          formik: formik,
          label: "Prevent the instance from being deleted",
          name: "security_protection_delete",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: (
            <Select
              id="security_protection_delete"
              name="security_protection_delete"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={optionYesNo}
              value={formik.values.security_protection_delete}
            />
          ),
        }),

        getConfigurationRow({
          formik: formik,
          label: "Run the instance in privileged mode (Containers only)",
          name: "security_privileged",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowDeny),
          children: (
            <Select
              id="security_privileged"
              name="security_privileged"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={optionAllowDeny}
              value={formik.values.security_privileged}
              disabled={isContainerOnlyDisabled}
            />
          ),
        }),

        getConfigurationRow({
          formik: formik,
          label:
            "Prevent instance file system from being UID/GID shifted on startup (Containers only)",
          name: "security_protection_shift",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: (
            <Select
              id="security_protection_shift"
              name="security_protection_shift"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={optionYesNo}
              value={formik.values.security_protection_shift}
              disabled={isContainerOnlyDisabled}
            />
          ),
        }),

        getConfigurationRow({
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
            />
          ),
        }),

        getConfigurationRow({
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
            />
          ),
        }),

        getConfigurationRow({
          formik: formik,
          label: "Unique idmap usage (Containers only)",
          name: "security_idmap_isolated",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: (
            <Select
              id="security_idmap_isolated"
              name="security_idmap_isolated"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={optionYesNo}
              value={formik.values.security_idmap_isolated}
              disabled={isContainerOnlyDisabled}
            />
          ),
        }),

        getConfigurationRow({
          formik: formik,
          label: "Allow /dev/lxd in the instance (Containers only)",
          name: "security_devlxd",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: (
            <Select
              id="security_devlxd"
              name="security_devlxd"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={optionYesNo}
              value={formik.values.security_devlxd}
              disabled={isContainerOnlyDisabled}
            />
          ),
        }),

        getConfigurationRow({
          formik: formik,
          label:
            "Make /1.0/images API available over /dev/lxd (Containers only)",
          name: "security_devlxd_images",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: (
            <Select
              id="security_devlxd_images"
              name="security_devlxd_images"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={optionYesNo}
              value={formik.values.security_devlxd_images}
              disabled={isContainerOnlyDisabled}
            />
          ),
        }),

        getConfigurationRow({
          formik: formik,
          label: "Enable secureboot (VMs only)",
          name: "security_secureboot",
          defaultValue: "",
          disabled: isVmOnlyDisabled,
          readOnlyRenderer: (val) => optionRenderer(val, optionTrueFalse),
          children: (
            <Select
              id="security_secureboot"
              name="security_secureboot"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={optionTrueFalse}
              value={formik.values.security_secureboot}
              disabled={isVmOnlyDisabled}
            />
          ),
        }),
      ]}
    />
  );
};

export default SecurityPoliciesForm;
