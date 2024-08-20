import { FC } from "react";
import { Col, Input, Row } from "@canonical/react-components";
import ProfileSelect from "pages/profiles/ProfileSelector";
import { FormikProps } from "formik/dist/types";
import { EditInstanceFormValues } from "pages/instances/EditInstance";
import { useSettings } from "context/useSettings";
import { isClusteredServer } from "util/settings";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import ScrollableForm from "components/ScrollableForm";

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

const EditInstanceDetails: FC<Props> = ({ formik, project }) => {
  const readOnly = formik.values.readOnly;
  const { data: settings } = useSettings();
  const isClustered = isClusteredServer(settings);

  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
          <Input
            id="name"
            name="name"
            type="text"
            label="Instance name"
            help="Click the name in the header to rename the instance"
            placeholder="Enter name"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.name}
            error={formik.touched.name ? formik.errors.name : null}
            required
            disabled={true}
          />
          <AutoExpandingTextArea
            id="description"
            name="description"
            label="Description"
            placeholder="Enter description"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.description}
            dynamicHeight
            disabled={readOnly}
          />
        </Col>
      </Row>
      {isClustered && (
        <Row>
          <Col size={12}>
            <Input
              id="target"
              name="target"
              type="text"
              label="Instance location"
              value={formik.values.location}
              required
              disabled={true}
            />
          </Col>
        </Row>
      )}
      <ProfileSelect
        project={project}
        selected={formik.values.profiles}
        setSelected={(value) => void formik.setFieldValue("profiles", value)}
        readOnly={readOnly}
      />
    </ScrollableForm>
  );
};

export default EditInstanceDetails;
