import { FC, useState } from "react";
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
import { ProjectFormValues } from "pages/projects/CreateProject";
import ProjectResourceLimitsForm from "pages/projects/forms/ProjectResourceLimitsForm";
import ClusterRestrictionForm from "pages/projects/forms/ClusterRestrictionForm";
import InstanceRestrictionForm from "pages/projects/forms/InstanceRestrictionForm";
import DeviceUsageRestrictionForm from "pages/projects/forms/DeviceUsageRestrictionForm";
import NetworkRestrictionForm from "pages/projects/forms/NetworkRestrictionForm";
import { FormikProps } from "formik/dist/types";
import { LxdProject } from "types/project";
import NotificationRow from "components/NotificationRow";
import { slugify } from "util/slugify";

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
  const [isRestrictionsOpen, setRestrictionsOpen] = useState(true);

  const toggleMenu = () => {
    setRestrictionsOpen((old) => !old);
  };

  return (
    <Form onSubmit={formik.handleSubmit} className="form">
      <ProjectFormMenu
        active={section}
        setActive={updateSection}
        isRestrictionsOpen={isRestrictionsOpen && formik.values.restricted}
        isRestrictionsDisabled={!formik.values.restricted}
        toggleRestrictionsOpen={toggleMenu}
      />
      <div className="details-form-wrapper">
        <NotificationRow />
        <Row className="form-contents" key={section}>
          <Col size={12}>
            {section === slugify(PROJECT_DETAILS) && (
              <ProjectDetailsForm
                formik={formik}
                project={project}
                isEdit={isEdit}
              />
            )}
            {section === slugify(RESOURCE_LIMITS) && (
              <ProjectResourceLimitsForm formik={formik} />
            )}
            {section === slugify(CLUSTERS) && (
              <ClusterRestrictionForm formik={formik} />
            )}
            {section === slugify(INSTANCES) && (
              <InstanceRestrictionForm formik={formik} />
            )}
            {section === slugify(DEVICE_USAGE) && (
              <DeviceUsageRestrictionForm formik={formik} />
            )}
            {section === slugify(NETWORKS) && (
              <NetworkRestrictionForm formik={formik} />
            )}
          </Col>
        </Row>
      </div>
    </Form>
  );
};

export default ProjectForm;
