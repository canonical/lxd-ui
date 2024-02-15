import { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import classnames from "classnames";
import {
  optionAllowDeny,
  optionTrueFalse,
  optionYesNo,
} from "util/instanceOptions";
import {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceKey } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";

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

export const securityPoliciesPayload = (
  values: InstanceAndProfileFormValues,
) => {
  return {
    [getInstanceKey("security_protection_delete")]:
      values.security_protection_delete,
    [getInstanceKey("security_privileged")]: values.security_privileged,
    [getInstanceKey("security_protection_shift")]:
      values.security_protection_shift,
    [getInstanceKey("security_idmap_base")]: values.security_idmap_base,
    [getInstanceKey("security_idmap_size")]:
      values.security_idmap_size?.toString(),
    [getInstanceKey("security_idmap_isolated")]: values.security_idmap_isolated,
    [getInstanceKey("security_devlxd")]: values.security_devlxd,
    [getInstanceKey("security_devlxd_images")]: values.security_devlxd_images,
    [getInstanceKey("security_secureboot")]: values.security_secureboot,
  };
};

interface Props {
  formik: InstanceAndProfileFormikProps;
}

const SecurityPoliciesForm: FC<Props> = ({ formik }) => {
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
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: (
            <Select options={optionYesNo} disabled={isContainerOnlyDisabled} />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "Enable secureboot (VMs only)",
          name: "security_secureboot",
          defaultValue: "",
          disabled: isVmOnlyDisabled,
          readOnlyRenderer: (val) => optionRenderer(val, optionTrueFalse),
          children: (
            <Select options={optionTrueFalse} disabled={isVmOnlyDisabled} />
          ),
        }),
      ]}
    />
  );
};

export default SecurityPoliciesForm;
