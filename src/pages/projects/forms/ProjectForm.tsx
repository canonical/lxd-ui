import React, { FC, useState } from "react";
import { Col, Form, Row } from "@canonical/react-components";
import ProjectFormMenu, {
  CLUSTERS,
  DEVICE_USAGE,
  INSTANCES,
  NETWORKS,
  PROJECT_DETAILS,
  RESOURCE_LIMITS,
} from "pages/projects/forms/ProjectFormMenu";
import ProjectDetailsForm from "pages/projects/forms/ProjectDetailsForm";
import { ProjectFormValues } from "pages/projects/CreateProjectForm";
import ResourceLimitsForm from "pages/projects/forms/ResourceLimitsForm";
import ClusterRestrictionForm from "pages/projects/forms/ClusterRestrictionForm";
import InstanceRestrictionForm from "pages/projects/forms/InstanceRestrictionForm";
import DeviceUsageRestrictionForm from "pages/projects/forms/DeviceUsageRestrictionForm";
import NetworkRestrictionForm from "pages/projects/forms/NetworkRestrictionForm";
import { FormikProps } from "formik/dist/types";
import { LxdProject } from "types/project";
import NotificationRow from "components/NotificationRow";

interface Props {
  formik: FormikProps<ProjectFormValues>;
  updateSection: (val: string) => void;
  section: string;
  project?: LxdProject;
  isEdit: boolean;
}

const ProjectForm: FC<Props> = ({
  formik,
  updateSection,
  section,
  project,
  isEdit,
}) => {
  const [isRestrictionsOpen, setRestrictionsOpen] = useState(false);

  const toggleMenu = () => {
    setRestrictionsOpen((old) => !old);
  };

  return (
    <Form onSubmit={formik.handleSubmit} stacked className="form">
      <ProjectFormMenu
        active={section}
        setActive={updateSection}
        isRestrictionsOpen={isRestrictionsOpen && formik.values.restricted}
        isRestrictionsDisabled={!formik.values.restricted}
        toggleRestrictionsOpen={toggleMenu}
      />
      <Row className="form-contents" key={section}>
        <Col size={12}>
          <NotificationRow />
          {section === PROJECT_DETAILS && (
            <ProjectDetailsForm
              formik={formik}
              project={project}
              isEdit={isEdit}
            />
          )}
          {section === RESOURCE_LIMITS && (
            <ResourceLimitsForm formik={formik} />
          )}
          {section === CLUSTERS && <ClusterRestrictionForm formik={formik} />}
          {section === INSTANCES && <InstanceRestrictionForm formik={formik} />}
          {section === DEVICE_USAGE && (
            <DeviceUsageRestrictionForm formik={formik} />
          )}
          {section === NETWORKS && <NetworkRestrictionForm formik={formik} />}
        </Col>
      </Row>
    </Form>
  );
};

export default ProjectForm;
