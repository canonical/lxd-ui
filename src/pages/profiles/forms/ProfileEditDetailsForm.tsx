import React, { FC } from "react";
import { Col, Row, Textarea } from "@canonical/react-components";
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
          <Textarea
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
          />
        </Col>
      </Row>
    </>
  );
};

export default ProfileEditDetailsForm;
