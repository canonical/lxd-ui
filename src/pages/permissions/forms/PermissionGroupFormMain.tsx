import { FC, ReactNode } from "react";
import { Row, Input, Col, Button, Icon } from "@canonical/react-components";
import { FormikProps } from "formik";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import ScrollableForm from "components/ScrollableForm";
import { PermissionGroupFormValues } from "./PermissionGroupForm";
import PermissionFormRows from "./PermissionFormRows";

interface Props {
  formik: FormikProps<PermissionGroupFormValues>;
}

const PermissionGroupFormMain: FC<Props> = ({ formik }) => {
  const getFormProps = (id: "name" | "description") => {
    return {
      id: id,
      name: id,
      onBlur: formik.handleBlur,
      onChange: formik.handleChange,
      value: formik.values[id],
      error: formik.touched[id] ? (formik.errors[id] as ReactNode) : null,
      placeholder: `Enter ${id.replaceAll("_", " ")}`,
    };
  };

  const handleAddPermission = () => {
    void formik.setFieldValue("permissions", [
      ...formik.values.permissions,
      {
        entityType: "server",
        entitlement: "can_view",
        url: "/1.0",
      },
    ]);
  };

  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
          <Input
            {...getFormProps("name")}
            type="text"
            label="Name"
            required
            disabled={!formik.values.isCreating || formik.values.readOnly}
          />
          <AutoExpandingTextArea
            {...getFormProps("description")}
            label="Description"
            disabled={formik.values.readOnly}
            dynamicHeight
          />
          {formik.values.permissions.length > 0 && (
            <PermissionFormRows
              formik={formik}
              disabled={formik.values.readOnly}
            />
          )}
          {!formik.values.readOnly && (
            <Button hasIcon onClick={handleAddPermission} type="button">
              <Icon name="plus" />
              <span>Add permission</span>
            </Button>
          )}
        </Col>
      </Row>
    </ScrollableForm>
  );
};

export default PermissionGroupFormMain;
