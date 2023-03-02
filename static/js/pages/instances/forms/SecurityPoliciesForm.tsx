import React, { FC, ReactNode } from "react";
import { CheckboxInput, Col, Input, Row } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { FormValues } from "pages/instances/CreateInstanceForm";

export interface SecurityPoliciesFormValues {
  protection_delete: boolean;
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
            name="protection_delete"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            checked={formik.values.protection_delete}
          />
          <CheckboxInput
            label="Run the instance in privileged mode (Containers only)"
            name="security_privileged"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            checked={formik.values.security_privileged}
          />
          <CheckboxInput
            label="Prevent instance file system from being UID/GID shifted on startup (Containers only)"
            name="security_protection_shift"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            checked={formik.values.security_protection_shift}
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
          />
          <Input
            label="Idmap size (Containers only)"
            placeholder="Enter number"
            name="security_idmap_size"
            type="text"
            value={formik.values.security_idmap_size}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
          <CheckboxInput
            label="Use unique idmap (Containers only)"
            name="security_idmap_isolated"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            checked={formik.values.security_idmap_isolated}
          />
          <hr />
          <CheckboxInput
            label="Allow /dev/lxd in the instance (Containers only)"
            name="security_devlxd"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            checked={formik.values.security_devlxd}
          />
          <CheckboxInput
            disabled={!formik.values.security_devlxd}
            label="Make /1.0/images API available over /dev/lxd (Containers only)"
            name="security_devlxd_images"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            checked={formik.values.security_devlxd_images}
          />
          <hr />
          <CheckboxInput
            label="Enable secureboot (VMs only)"
            name="security_secureboot"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            checked={formik.values.security_secureboot}
          />
        </Col>
      </Row>
    </>
  );
};

export default SecurityPoliciesForm;
