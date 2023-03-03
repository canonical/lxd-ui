import React, { FC, ReactNode } from "react";
import { CheckboxInput, Col, Input, Row } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { FormValues } from "pages/instances/CreateInstanceForm";
import classnames from "classnames";

export interface SecurityPoliciesFormValues {
  security_protection_delete: boolean;
  security_privileged: boolean;
  security_protection_shift: boolean;
  security_idmap_base: string;
  security_idmap_size: string;
  security_idmap_isolated: boolean;
  security_devlxd: boolean;
  security_devlxd_images: boolean;
  security_secureboot: boolean;
}

interface Props {
  formik: FormikProps<FormValues>;
  children?: ReactNode;
}

const SecurityPoliciesForm: FC<Props> = ({ formik, children }) => {
  return (
    <>
      {children}
      <Row>
        <Col size={9}>
          <CheckboxInput
            label="Prevent the instance from being deleted"
            name="security_protection_delete"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            checked={formik.values.security_protection_delete}
          />
          <CheckboxInput
            label="Run the instance in privileged mode (Containers only)"
            name="security_privileged"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            checked={formik.values.security_privileged}
            disabled={formik.values.instanceType !== "container"}
          />
          <CheckboxInput
            label="Prevent instance file system from being UID/GID shifted on startup (Containers only)"
            name="security_protection_shift"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            checked={formik.values.security_protection_shift}
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
          <CheckboxInput
            label="Use unique idmap (Containers only)"
            name="security_idmap_isolated"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            checked={formik.values.security_idmap_isolated}
            disabled={formik.values.instanceType !== "container"}
          />
          <hr />
          <CheckboxInput
            label="Allow /dev/lxd in the instance (Containers only)"
            name="security_devlxd"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            checked={formik.values.security_devlxd}
            disabled={formik.values.instanceType !== "container"}
          />
          <CheckboxInput
            label="Make /1.0/images API available over /dev/lxd (Containers only)"
            name="security_devlxd_images"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            checked={formik.values.security_devlxd_images}
            disabled={
              !formik.values.security_devlxd ||
              formik.values.instanceType !== "container"
            }
          />
          <hr />
          <CheckboxInput
            label="Enable secureboot (VMs only)"
            name="security_secureboot"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            checked={formik.values.security_secureboot}
            disabled={formik.values.instanceType !== "virtual-machine"}
          />
        </Col>
      </Row>
    </>
  );
};

export default SecurityPoliciesForm;
