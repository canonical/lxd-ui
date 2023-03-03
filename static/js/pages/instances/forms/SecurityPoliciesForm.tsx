import React, { FC, ReactNode } from "react";
import { CheckboxInput, Col, Input, Row } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { FormValues } from "pages/instances/CreateInstanceForm";
import classnames from "classnames";
import { boolPayload } from "util/limits";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";

export interface SecurityPoliciesFormValues {
  security_protection_delete?: boolean;
  security_privileged?: boolean;
  security_protection_shift?: boolean;
  security_idmap_base?: string;
  security_idmap_size?: string;
  security_idmap_isolated?: boolean;
  security_devlxd?: boolean;
  security_devlxd_images?: boolean;
  security_secureboot?: boolean;
}

export const securityPoliciesPayload = (
  values: FormValues | EditInstanceFormValues,
  isVm: boolean
) => {
  return {
    ["security.protection.delete"]: boolPayload(
      values.security_protection_delete
    ),
    ["security.privileged"]: isVm
      ? undefined
      : boolPayload(values.security_privileged),
    ["security.protection.shift"]: isVm
      ? undefined
      : boolPayload(values.security_protection_shift),
    ["security.idmap.base"]: isVm ? undefined : values.security_idmap_base,
    ["security.idmap.size"]: isVm ? undefined : values.security_idmap_size,
    ["security.idmap.isolated"]: isVm
      ? undefined
      : boolPayload(values.security_idmap_isolated),
    ["security.devlxd"]: isVm ? undefined : boolPayload(values.security_devlxd),
    ["security.devlxd.images"]: isVm
      ? undefined
      : boolPayload(values.security_devlxd_images),
    ["security.secureboot"]: !isVm
      ? undefined
      : boolPayload(values.security_secureboot),
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
          <CheckboxInput
            label="Prevent the instance from being deleted"
            name="security_protection_delete"
            onBlur={formik.handleBlur}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              formik.setFieldValue(
                "security_protection_delete",
                e.target.checked
              )
            }
            checked={formik.values.security_protection_delete}
            indeterminate={
              formik.values.security_protection_delete === undefined
            }
          />
          <CheckboxInput
            label="Run the instance in privileged mode (Containers only)"
            name="security_privileged"
            onBlur={formik.handleBlur}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              formik.setFieldValue("security_privileged", e.target.checked)
            }
            checked={formik.values.security_privileged}
            disabled={formik.values.instanceType !== "container"}
            indeterminate={formik.values.security_privileged === undefined}
          />
          <CheckboxInput
            label="Prevent instance file system from being UID/GID shifted on startup (Containers only)"
            name="security_protection_shift"
            onBlur={formik.handleBlur}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              formik.setFieldValue(
                "security_protection_shift",
                e.target.checked
              )
            }
            checked={formik.values.security_protection_shift}
            disabled={formik.values.instanceType !== "container"}
            indeterminate={
              formik.values.security_protection_shift === undefined
            }
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              formik.setFieldValue("security_idmap_isolated", e.target.checked)
            }
            checked={formik.values.security_idmap_isolated}
            disabled={formik.values.instanceType !== "container"}
            indeterminate={formik.values.security_idmap_isolated === undefined}
          />
          <hr />
          <CheckboxInput
            label="Allow /dev/lxd in the instance (Containers only)"
            name="security_devlxd"
            onBlur={formik.handleBlur}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              formik.setFieldValue("security_devlxd", e.target.checked)
            }
            checked={formik.values.security_devlxd}
            disabled={formik.values.instanceType !== "container"}
            indeterminate={formik.values.security_devlxd === undefined}
          />
          <CheckboxInput
            label="Make /1.0/images API available over /dev/lxd (Containers only)"
            name="security_devlxd_images"
            onBlur={formik.handleBlur}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              formik.setFieldValue("security_devlxd_images", e.target.checked)
            }
            checked={formik.values.security_devlxd_images}
            disabled={
              !formik.values.security_devlxd ||
              formik.values.instanceType !== "container"
            }
            indeterminate={formik.values.security_devlxd_images === undefined}
          />
          <hr />
          <CheckboxInput
            label="Enable secureboot (VMs only)"
            name="security_secureboot"
            onBlur={formik.handleBlur}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              formik.setFieldValue("security_secureboot", e.target.checked)
            }
            checked={formik.values.security_secureboot}
            disabled={formik.values.instanceType !== "virtual-machine"}
            indeterminate={formik.values.security_secureboot === undefined}
          />
        </Col>
      </Row>
    </>
  );
};

export default SecurityPoliciesForm;
