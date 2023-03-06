import React, { FC } from "react";
import { Col, Input, Row } from "@canonical/react-components";
import ProfileSelect from "pages/profiles/ProfileSelector";
import { FormikProps } from "formik/dist/types";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";

export interface InstanceEditDetailsFormValues {
  name: string;
  description?: string;
  image: string;
  instanceType: string;
  profiles: string[];
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
  return (
    <>
      <Row>
        <Col size={8}>
          <Input
            id="description"
            name="description"
            type="text"
            label="Instance Description"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.description}
          />
        </Col>
      </Row>
      <ProfileSelect
        project={project}
        selected={formik.values.profiles}
        setSelected={(value) => formik.setFieldValue("profiles", value)}
      />
    </>
  );
};

export default InstanceEditDetailsForm;
