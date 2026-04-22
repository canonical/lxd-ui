import type { FC } from "react";
import { Col, Input, Row, OutputField } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import type { CreateProfileFormValues } from "types/forms/instanceAndProfile";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import ScrollableForm from "components/ScrollableForm";
import { ensureEditMode } from "util/editMode";
import SshKeyForm from "components/forms/SshKeyForm";
import { useIsClustered } from "context/useIsClustered";
import PlacementGroupSelect from "pages/instances/forms/PlacementGroupSelect";

interface Props {
  formik: FormikProps<CreateProfileFormValues>;
  isEdit: boolean;
  project: string;
}

const ProfileDetailsForm: FC<Props> = ({ formik, isEdit, project }) => {
  const isDefaultProfile = formik.values.name === "default";
  const isClustered = useIsClustered();
  const helpText = !isDefaultProfile
    ? "Click the name in the header to rename the profile."
    : "Default profile cannot be renamed.";

  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
          {isEdit ? (
            <OutputField
              id="name"
              label="Profile name"
              value={formik.values.name}
              help={helpText}
            />
          ) : (
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
            />
          )}
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
          {isClustered && (
            <PlacementGroupSelect
              value={formik.values.placement_group}
              setValue={(value) => {
                ensureEditMode(formik);
                formik.setFieldValue("placement_group", value || undefined);
              }}
              project={project}
              hasNoneOption
            />
          )}
          <SshKeyForm formik={formik} />
        </Col>
      </Row>
    </ScrollableForm>
  );
};

export default ProfileDetailsForm;
