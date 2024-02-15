import { FC } from "react";
import { Col, Input, Row } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { CreateProfileFormValues } from "pages/profiles/CreateProfile";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import ScrollableForm from "components/ScrollableForm";

export interface ProfileDetailsFormValues {
  name: string;
  description?: string;
  entityType: "profile";
  readOnly: boolean;
}

export const profileDetailPayload = (values: CreateProfileFormValues) => {
  return {
    name: values.name,
    description: values.description,
  };
};

interface Props {
  formik: FormikProps<CreateProfileFormValues>;
  isEdit: boolean;
}

const ProfileDetailsForm: FC<Props> = ({ formik, isEdit }) => {
  const readOnly = formik.values.readOnly;
  const isDefaultProfile = formik.values.name === "default";

  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
          <Input
            id="name"
            name="name"
            type="text"
            label="Profile name"
            placeholder="Enter name"
            help={
              isEdit &&
              !isDefaultProfile &&
              "Click the name in the header to rename the profile"
            }
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.name}
            error={formik.touched.name ? formik.errors.name : null}
            required
            disabled={isEdit}
          />
          <AutoExpandingTextArea
            id="description"
            name="description"
            label="Description"
            placeholder="Enter description"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.description}
            disabled={readOnly}
            dynamicHeight
          />
        </Col>
      </Row>
    </ScrollableForm>
  );
};

export default ProfileDetailsForm;
