import type { FC } from "react";
import { Col, Input, Row, Select } from "@canonical/react-components";
import ProfileSelector from "pages/profiles/ProfileSelector";
import type { FormikProps } from "formik/dist/types";
import type { EditInstanceFormValues } from "types/forms/instanceAndProfile";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import ScrollableForm from "components/ScrollableForm";
import { ensureEditMode } from "util/instanceEdit";
import SshKeyForm from "components/forms/SshKeyForm";
import { useIsClustered } from "context/useIsClustered";
import PlacementGroupSelect from "pages/instances/forms/PlacementGroupSelect";
import { getInstanceField } from "util/instanceConfigFields";

export const instanceEditDetailPayload = (values: EditInstanceFormValues) => {
  return {
    name: values.name,
    description: values.description,
    type: values.instanceType,
    profiles: values.profiles,
  };
};

export const instanceEditConfigPayload = (values: EditInstanceFormValues) => {
  return {
    [getInstanceField("placement_group")]: values.placement_group,
  };
};

interface Props {
  formik: FormikProps<EditInstanceFormValues>;
  project: string;
}

const EditInstanceDetails: FC<Props> = ({ formik, project }) => {
  const isClustered = useIsClustered();

  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
          <Input
            id="name"
            name="name"
            type="text"
            label="Name"
            help="Click the instance name in the header to rename the instance"
            placeholder="Enter name"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.name}
            error={formik.touched.name ? formik.errors.name : null}
            disabled={true}
          />
          <AutoExpandingTextArea
            id="description"
            name="description"
            label="Description"
            placeholder="Enter description"
            onBlur={formik.handleBlur}
            onChange={(e) => {
              ensureEditMode(formik);
              formik.handleChange(e);
            }}
            value={formik.values.description}
            disabled={!!formik.values.editRestriction}
            title={formik.values.editRestriction}
          />
        </Col>
      </Row>
      {isClustered && (
        <Row>
          <Col size={12}>
            <Select
              id="target"
              name="target"
              options={[
                {
                  label: formik.values.location,
                  value: formik.values.location,
                },
              ]}
              label="Cluster member"
              value={formik.values.location}
              disabled={true}
              help="Use the migrate button in the header to move the instance to another cluster member"
            />
            <PlacementGroupSelect
              value={formik.values.placement_group}
              setValue={(value) => {
                ensureEditMode(formik);
                formik.setFieldValue("placement_group", value || undefined);
              }}
              project={project}
              profileNames={formik.values.profiles}
              hasNoneOption
            />
          </Col>
        </Row>
      )}
      <ProfileSelector
        project={project}
        selected={formik.values.profiles}
        setSelected={(value) => {
          ensureEditMode(formik);
          formik.setFieldValue("profiles", value);
        }}
        disabledReason={formik.values.editRestriction}
        initialProfiles={formik.initialValues.profiles}
      />
      <SshKeyForm
        formik={formik}
        disabledReason={formik.values.editRestriction}
      />
    </ScrollableForm>
  );
};

export default EditInstanceDetails;
