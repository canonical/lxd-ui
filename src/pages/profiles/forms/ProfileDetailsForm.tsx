import type { FC } from "react";
import { Col, Input, Row } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import type { CreateProfileFormValues } from "pages/profiles/CreateProfile";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import ScrollableForm from "components/ScrollableForm";
import { ensureEditMode } from "util/instanceEdit";
import SshKeyForm from "components/forms/SshKeyForm";

export interface ProfileDetailsFormValues {
  name: string;
  description?: string;
  entityType: "profile";
  readOnly: boolean;
  editRestriction?: string;
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
            onChange={(e) => {
              if (isEdit) {
                ensureEditMode(formik);
              }
              formik.handleChange(e);
            }}
            value={formik.values.description}
            disabled={!!formik.values.editRestriction}
            title={formik.values.editRestriction}
          />
          <SshKeyForm formik={formik} />
        </Col>
      </Row>
    </ScrollableForm>
  );
};

export default ProfileDetailsForm;
