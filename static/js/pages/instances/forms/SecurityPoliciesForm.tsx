import React, { FC, ReactNode } from "react";
import { Col, Input, Row, Select } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { FormValues } from "pages/instances/CreateInstanceForm";
import classnames from "classnames";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";
import { booleanFields } from "util/instanceOptions";

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

export const securityPoliciesPayload = (
  values: FormValues | EditInstanceFormValues,
  isVm: boolean
) => {
  return {
    ["security.protection.delete"]: values.security_protection_delete,
    ["security.privileged"]: isVm ? undefined : values.security_privileged,
    ["security.protection.shift"]: isVm
      ? undefined
      : values.security_protection_shift,
    ["security.idmap.base"]: isVm ? undefined : values.security_idmap_base,
    ["security.idmap.size"]: isVm ? undefined : values.security_idmap_size,
    ["security.idmap.isolated"]: isVm
      ? undefined
      : values.security_idmap_isolated,
    ["security.devlxd"]: isVm ? undefined : values.security_devlxd,
    ["security.devlxd.images"]: isVm
      ? undefined
      : values.security_devlxd_images,
    ["security.secureboot"]: !isVm ? undefined : values.security_secureboot,
  };
};

interface Props {
  formik: FormikProps<FormValues> | FormikProps<EditInstanceFormValues>;
  children?: ReactNode;
}

const SecurityPoliciesForm: FC<Props> = ({ formik, children }) => {
  return (
    <>
      {children}
      <Row>
        <Col size={9}>
          <Select
            label="Prevent the instance from being deleted"
            name="security_protection_delete"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            options={booleanFields}
            value={formik.values.security_protection_delete}
          />
          <Select
            label="Run the instance in privileged mode (Containers only)"
            name="security_privileged"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            options={booleanFields}
            value={formik.values.security_privileged}
            disabled={formik.values.instanceType !== "container"}
          />
          <Select
            label="Prevent instance file system from being UID/GID shifted on startup (Containers only)"
            name="security_protection_shift"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            options={booleanFields}
            value={formik.values.security_protection_shift}
            disabled={formik.values.instanceType !== "container"}
          />
          <hr />
          <Input
            label="Base host id (Containers only)"
            placeholder="Enter ID"
            name="security_idmap_base"
            type="text"
            value={formik.values.security_idmap_base}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            disabled={formik.values.instanceType !== "container"}
            labelClassName={classnames({
              "is-disabled": formik.values.instanceType !== "container",
            })}
          />
          <Input
            label="Idmap size (Containers only)"
            placeholder="Enter number"
            name="security_idmap_size"
            type="text"
            value={formik.values.security_idmap_size}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            disabled={formik.values.instanceType !== "container"}
            labelClassName={classnames({
              "is-disabled": formik.values.instanceType !== "container",
            })}
          />
          <Select
            label="Use unique idmap (Containers only)"
            name="security_idmap_isolated"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            options={booleanFields}
            value={formik.values.security_idmap_isolated}
            disabled={formik.values.instanceType !== "container"}
          />
          <hr />
          <Select
            label="Allow /dev/lxd in the instance (Containers only)"
            name="security_devlxd"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            options={booleanFields}
            value={formik.values.security_devlxd}
            disabled={formik.values.instanceType !== "container"}
          />
          <Select
            label="Make /1.0/images API available over /dev/lxd (Containers only)"
            name="security_devlxd_images"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            options={booleanFields}
            value={formik.values.security_devlxd_images}
            disabled={
              !formik.values.security_devlxd ||
              formik.values.instanceType !== "container"
            }
          />
          <hr />
          <Select
            label="Enable secureboot (VMs only)"
            name="security_secureboot"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            options={booleanFields}
            value={formik.values.security_secureboot}
            disabled={formik.values.instanceType !== "virtual-machine"}
          />
        </Col>
      </Row>
    </>
  );
};

export default SecurityPoliciesForm;
