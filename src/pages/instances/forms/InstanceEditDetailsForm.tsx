import React, { FC } from "react";
import { Col, Input, Row, Textarea } from "@canonical/react-components";
import ProfileSelect from "pages/profiles/ProfileSelector";
import { FormikProps } from "formik/dist/types";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";

export interface InstanceEditDetailsFormValues {
  name: string;
  description?: string;
  instanceType: string;
  profiles: string[];
  type: string;
  readOnly: boolean;
}

export const instanceEditDetailPayload = (values: EditInstanceFormValues) => {
  return {
    name: values.name,
    description: values.description,
    type: values.instanceType,
    profiles: values.profiles,
  };
};

interface Props {
  formik: FormikProps<EditInstanceFormValues>;
  project: string;
}

const InstanceEditDetailsForm: FC<Props> = ({ formik, project }) => {
  const isReadOnly = formik.values.readOnly;

  return (
    <div className="details">
      <Row>
        <Col size={8}>
          <Input
            id="name"
            name="name"
            type="text"
            label="Profile name"
            placeholder="Enter name"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.name}
            error={formik.touched.name ? formik.errors.name : null}
            required
            disabled={isReadOnly}
          />
          <Textarea
            id="description"
            name="description"
            label="Description"
            placeholder="Enter description"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.description}
            rows={Math.max(
              1,
              Math.ceil((formik.values.description?.length ?? 0) / 46)
            )}
            disabled={isReadOnly}
          />
        </Col>
      </Row>
      <ProfileSelect
        project={project}
        selected={formik.values.profiles}
        setSelected={(value) => formik.setFieldValue("profiles", value)}
        isReadOnly={isReadOnly}
      />
    </div>
  );
};

export default InstanceEditDetailsForm;
