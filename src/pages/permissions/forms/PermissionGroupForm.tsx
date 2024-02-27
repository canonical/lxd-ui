import { FC, useEffect } from "react";
import { Form, Input, Row, Col, useNotify } from "@canonical/react-components";
import { FormikProps } from "formik";
import useEventListener from "@use-it/event-listener";
import { updateMaxHeight } from "util/updateMaxHeight";
import { LxdGroup } from "types/permissions";
import PermissionGroupFormMenu from "./PermissionGroupFormMenu";
import PermissionGroupFormMain from "./PermissionGroupFormMain";
import { PermissionRowValues } from "./PermissionFormRows";

export interface PermissionGroupFormValues {
  isCreating: boolean;
  readOnly: boolean;
  name: string;
  description: string;
  permissions: PermissionRowValues[];
}

interface Props {
  formik: FormikProps<PermissionGroupFormValues>;
  section: string;
}

export const permissionGroupFormToPayload = (
  values: PermissionGroupFormValues,
): LxdGroup => {
  // filter out any permissions created but not associated to any entities
  const permissions = values.permissions.filter(
    (permission) => !!permission.url,
  );
  return {
    name: values.name,
    description: values.description,
    permissions: permissions.map((permission) => ({
      entity_type: permission.entityType,
      entitlement: permission.entitlement,
      url: permission.url,
    })),
  };
};

const PermissionGroupForm: FC<Props> = ({ formik, section }) => {
  const notify = useNotify();

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useEventListener("resize", updateFormHeight);

  return (
    <Form className="form permission-group-form" onSubmit={formik.handleSubmit}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      <PermissionGroupFormMenu
        active={section}
        setActive={() => {}}
        formik={formik}
      />
      <Row className="form-contents" key={section}>
        <Col size={12}>
          <PermissionGroupFormMain formik={formik} />
        </Col>
      </Row>
    </Form>
  );
};

export default PermissionGroupForm;
