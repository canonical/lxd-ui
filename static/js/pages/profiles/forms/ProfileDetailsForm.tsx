import React, { FC } from "react";
import { Col, Input, Row } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { CreateProfileFormValues } from "pages/profiles/CreateProfileForm";

export interface ProfileDetailsFormValues {
  name: string;
  description?: string;
  type: string;
}

export const profileDetailPayload = (values: CreateProfileFormValues) => {
  return {
    name: values.name,
    description: values.description,
  };
};

interface Props {
  formik: FormikProps<CreateProfileFormValues>;
}

const ProfileDetailsForm: FC<Props> = ({ formik }) => {
  return (
    <>
      <Row>
        <Col size={8}>
          <Input
            id="name"
            name="name"
            type="text"
            label="Profile name"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.name}
            error={formik.touched.name ? formik.errors.name : null}
          />
          <Input
            id="description"
            name="description"
            type="text"
            label="Profile Description"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.description}
          />
        </Col>
      </Row>
    </>
  );
};

export default ProfileDetailsForm;
