import type { FC } from "react";
import { Button, Input, Select } from "@canonical/react-components";
import type {
  CreateInstanceFormValues,
  SecurityPoliciesFormValues,
} from "types/forms/instanceAndProfile";
import classnames from "classnames";
import {
  optionAllowDeny,
  optionTrueFalse,
  optionYesNo,
} from "util/instanceOptions";
import type { InstanceAndProfileFormikProps } from "../../types/forms/instanceAndProfileFormProps";

import {
  getConfigurationRow,
  getConfigurationRowBase,
} from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceField } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { BOOT } from "pages/instances/forms/InstanceFormMenu";

export const securityPoliciesPayload = (values: SecurityPoliciesFormValues) => {
  return {
    [getInstanceField("security_protection_delete")]:
      values.security_protection_delete,
    [getInstanceField("security_privileged")]: values.security_privileged,
    [getInstanceField("security_nesting")]: values.security_nesting,
    [getInstanceField("security_protection_shift")]:
      values.security_protection_shift,
    [getInstanceField("security_idmap_base")]: values.security_idmap_base,
    [getInstanceField("security_idmap_size")]:
      values.security_idmap_size?.toString(),
    [getInstanceField("security_idmap_isolated")]:
      values.security_idmap_isolated,
    [getInstanceField("security_devlxd")]: values.security_devlxd,
    [getInstanceField("security_devlxd_images")]: values.security_devlxd_images,
    [getInstanceField("security_secureboot")]: values.security_secureboot,
    [getInstanceField("security_csm")]: values.security_csm,
  };
};

interface Props {
  formik: InstanceAndProfileFormikProps;
  setSection: (section: string) => void;
}

const SecurityPoliciesForm: FC<Props> = ({ formik, setSection }) => {
  const { hasInstanceBootMode } = useSupportedFeatures();
  const isInstance = formik.values.entityType === "instance";
  const isContainerOnlyDisabled =
    isInstance &&
    (formik.values as CreateInstanceFormValues).instanceType !== "container";
  const isVmOnlyDisabled =
    isInstance &&
    (formik.values as CreateInstanceFormValues).instanceType !==
      "virtual-machine";

  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "Protect deletion",
          name: "security_protection_delete",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: <Select options={optionYesNo} />,
        }),

        getConfigurationRow({
          formik,
          label: "Privileged (Containers only)",
          name: "security_privileged",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled
            ? "Only available for containers"
            : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowDeny),
          children: (
            <Select
              options={optionAllowDeny}
              disabled={isContainerOnlyDisabled}
            />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "Nesting (Containers only)",
          name: "security_nesting",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled
            ? "Only available for containers"
            : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowDeny),
          children: (
            <Select
              options={optionAllowDeny}
              disabled={isContainerOnlyDisabled}
            />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "Protect UID/GID shift (Containers only)",
          name: "security_protection_shift",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled
            ? "Only available for containers"
            : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: (
            <Select options={optionYesNo} disabled={isContainerOnlyDisabled} />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "Base host id (Containers only)",
          name: "security_idmap_base",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled
            ? "Only available for containers"
            : undefined,
          children: (
            <Input
              placeholder="Enter ID"
              type="text"
              disabled={isContainerOnlyDisabled}
              labelClassName={classnames({
                "is-disabled": isContainerOnlyDisabled,
              })}
            />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "Idmap size (Containers only)",
          name: "security_idmap_size",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled
            ? "Only available for containers"
            : undefined,
          children: (
            <Input
              placeholder="Enter number"
              type="number"
              min={0}
              disabled={isContainerOnlyDisabled}
              labelClassName={classnames({
                "is-disabled": isContainerOnlyDisabled,
              })}
            />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "Unique idmap (Containers only)",
          name: "security_idmap_isolated",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled
            ? "Only available for containers"
            : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: (
            <Select options={optionYesNo} disabled={isContainerOnlyDisabled} />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "Allow /dev/lxd in the instance (Containers only)",
          name: "security_devlxd",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled
            ? "Only available for containers"
            : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: (
            <Select options={optionYesNo} disabled={isContainerOnlyDisabled} />
          ),
        }),

        getConfigurationRow({
          formik,
          label:
            "Make /1.0/images API available over /dev/lxd (Containers only)",
          name: "security_devlxd_images",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled
            ? "Only available for containers"
            : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: (
            <Select options={optionYesNo} disabled={isContainerOnlyDisabled} />
          ),
        }),

        ...(hasInstanceBootMode
          ? [
              getConfigurationRowBase({
                className: "u-text--muted",
                configuration: (
                  <>
                    <b>Enable secureboot (VMs only)</b> and{" "}
                    <b>Enable CSM (VMs only)</b>
                  </>
                ),
                inherited: "",
                override: (
                  <Button
                    appearance="link"
                    type="button"
                    onClick={() => {
                      setSection(BOOT);
                    }}
                  >
                    See boot mode
                  </Button>
                ),
              }),
            ]
          : [
              getConfigurationRow({
                formik,
                label: "Enable secureboot (VMs only)",
                name: "security_secureboot",
                defaultValue: "",
                disabled: isVmOnlyDisabled,
                disabledReason: isVmOnlyDisabled
                  ? "Only available for virtual machines"
                  : undefined,
                readOnlyRenderer: (val) => optionRenderer(val, optionTrueFalse),
                children: (
                  <Select
                    options={optionTrueFalse}
                    disabled={isVmOnlyDisabled}
                  />
                ),
              }),

              getConfigurationRow({
                formik,
                label: "Enable CSM (VMs only)",
                name: "security_csm",
                defaultValue: "",
                disabled: isVmOnlyDisabled,
                disabledReason: isVmOnlyDisabled
                  ? "Only available for virtual machines"
                  : undefined,
                readOnlyRenderer: (val) => optionRenderer(val, optionTrueFalse),
                children: (
                  <Select
                    options={optionTrueFalse}
                    disabled={isVmOnlyDisabled}
                  />
                ),
              }),
            ]),
      ]}
    />
  );
};

export default SecurityPoliciesForm;
