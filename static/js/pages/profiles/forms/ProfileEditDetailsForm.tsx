import React, { FC } from "react";
import { Col, Input, Row } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { EditProfileFormValues } from "pages/profiles/EditProfileForm";

export interface ProfileEditDetailsFormValues {
  name: string;
  description?: string;
  type: string;
}

export const profileEditDetailPayload = (values: EditProfileFormValues) => {
  return {
    name: values.name,
    description: values.description,
  };
};

interface Props {
  formik: FormikProps<EditProfileFormValues>;
}

const ProfileEditDetailsForm: FC<Props> = ({ formik }) => {
  return (
    <>
      <Row>
        <Col size={8}>
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

export default ProfileEditDetailsForm;
