import React, { FC, ReactNode } from "react";
import { Col, Input, Row, Select } from "@canonical/react-components";
import { CreateInstanceFormValues } from "pages/instances/CreateInstanceForm";
import classnames from "classnames";
import { booleanFields } from "util/instanceOptions";
import {
  SharedFormikTypes,
  SharedFormTypes,
} from "pages/instances/forms/sharedFormTypes";

export interface SecurityPoliciesFormValues {
  security_protection_delete?: string;
  security_privileged?: string;
  security_protection_shift?: string;
  security_idmap_base?: string;
  security_idmap_size?: string;
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
    ["security.idmap.size"]: values.security_idmap_size,
    ["security.idmap.isolated"]: values.security_idmap_isolated,
    ["security.devlxd"]: values.security_devlxd,
    ["security.devlxd.images"]: values.security_devlxd_images,
    ["security.secureboot"]: values.security_secureboot,
  };
};

interface Props {
  formik: SharedFormikTypes;
  children?: ReactNode;
}

const SecurityPoliciesForm: FC<Props> = ({ formik, children }) => {
  const isInstance = formik.values.type === "instance";
  const isContainerOnlyDisabled =
    isInstance &&
    (formik.values as CreateInstanceFormValues).instanceType !== "container";
  const isVmOnlyDisabled =
    isInstance &&
    (formik.values as CreateInstanceFormValues).instanceType !==
      "virtual-machine";

  return (
    <>
      {children}
      <Row>
        <Col size={8}>
          <Select
            id="securityProtectionDelete"
            label="Prevent the instance from being deleted"
            name="security_protection_delete"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            options={booleanFields(isInstance)}
            value={formik.values.security_protection_delete}
          />
          <Select
            id="securityPrivileged"
            label="Run the instance in privileged mode (Containers only)"
            name="security_privileged"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            options={booleanFields(isInstance)}
            value={formik.values.security_privileged}
            disabled={isContainerOnlyDisabled}
          />
          <Select
            id="securityProtectionShift"
            label="Prevent instance file system from being UID/GID shifted on startup (Containers only)"
            name="security_protection_shift"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            options={booleanFields(isInstance)}
            value={formik.values.security_protection_shift}
            disabled={isContainerOnlyDisabled}
          />
          <hr />
          <Input
            id="securityIdmapBase"
            label="Base host id (Containers only)"
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
          <Input
            id="securityIdmapSize"
            label="Idmap size (Containers only)"
            placeholder="Enter number"
            name="security_idmap_size"
            type="text"
            value={formik.values.security_idmap_size}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            disabled={isContainerOnlyDisabled}
            labelClassName={classnames({
              "is-disabled": isContainerOnlyDisabled,
            })}
          />
          <Select
            id="securityIdmapIsolated"
            label="Use unique idmap (Containers only)"
            name="security_idmap_isolated"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            options={booleanFields(isInstance)}
            value={formik.values.security_idmap_isolated}
            disabled={isContainerOnlyDisabled}
          />
          <hr />
          <Select
            id="securityDevlxd"
            label="Allow /dev/lxd in the instance (Containers only)"
            name="security_devlxd"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            options={booleanFields(isInstance)}
            value={formik.values.security_devlxd}
            disabled={isContainerOnlyDisabled}
          />
          <Select
            id="securityDevlxdImages"
            label="Make /1.0/images API available over /dev/lxd (Containers only)"
            name="security_devlxd_images"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            options={booleanFields(isInstance)}
            value={formik.values.security_devlxd_images}
            disabled={!formik.values.security_devlxd || isContainerOnlyDisabled}
          />
          <hr />
          <Select
            id="securitySecureboot"
            label="Enable secureboot (VMs only)"
            name="security_secureboot"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            options={booleanFields(isInstance)}
            value={formik.values.security_secureboot}
            disabled={isVmOnlyDisabled}
          />
        </Col>
      </Row>
    </>
  );
};

export default SecurityPoliciesForm;
