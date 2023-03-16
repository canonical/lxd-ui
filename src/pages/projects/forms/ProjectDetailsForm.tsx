import React, { FC } from "react";
import { Col, Input, Row, Textarea } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";

export interface ProjectDetailsFormValues {
  name: string;
  description?: string;
}

export const projectDetailPayload = (values: ProjectDetailsFormValues) => {
  return {
    name: values.name,
    description: values.description,
  };
};

interface Props {
  formik: FormikProps<ProjectDetailsFormValues>;
  isCreateMode: boolean;
}

const ProjectDetailsForm: FC<Props> = ({ formik, isCreateMode }) => {
  return (
    <Row>
      <Col size={8}>
        <Input
          id="name"
          name="name"
          type="text"
          label="Project name"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.name}
          error={formik.touched.name ? formik.errors.name : null}
          disabled={!isCreateMode}
        />
        <Textarea
          id="description"
          name="description"
          label="Description"
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
  );
};

export default ProjectDetailsForm;
