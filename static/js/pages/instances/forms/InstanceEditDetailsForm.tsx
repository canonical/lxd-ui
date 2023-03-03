import React, { FC } from "react";
import { Col, Input, Row, Select } from "@canonical/react-components";
import ProfileSelect from "pages/profiles/ProfileSelector";
import { instanceCreationTypes } from "util/instanceOptions";
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
        <Col size={9}>
          <Input
            id="name"
            name="name"
            type="text"
            label="Instance name"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.name}
            disabled={true}
          />
          <Input
            id="description"
            name="description"
            type="text"
            label="Instance Description"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.description}
          />
          <Input
            id="baseImage"
            name="baseImage"
            label="Base Image"
            type="text"
            value={formik.values.image}
            disabled
          />
          <Select
            id="instanceType"
            label="Instance type"
            name="instanceType"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            options={instanceCreationTypes}
            value={formik.values.instanceType}
            disabled
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
