import React, { FC, useEffect, useState } from "react";
import { Col, Form, Row } from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import { updateProject } from "api/projects";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNotify } from "context/notify";
import DeleteProjectBtn from "pages/projects/actions/DeleteProjectBtn";
import ProjectFormMenu, {
  PROJECT_DETAILS,
} from "pages/projects/forms/ProjectFormMenu";
import ProjectDetailsForm, {
  projectDetailPayload,
} from "pages/projects/forms/ProjectDetailsForm";
import SubmitButton from "components/SubmitButton";
import { useFormik } from "formik";
import { CreateProjectFormValues } from "pages/projects/CreateProjectForm";
import * as Yup from "yup";
import { LxdProject } from "types/project";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";

interface Props {
  project: LxdProject;
}

const EditProjectForm: FC<Props> = ({ project }) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [section, setSection] = useState(PROJECT_DETAILS);
  const [isConfigOpen, setConfigOpen] = useState(false);

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useEventListener("resize", updateFormHeight);

  const ProjectSchema = Yup.object().shape({
    name: Yup.string().required(),
  });

  const formik = useFormik<CreateProjectFormValues>({
    initialValues: {
      name: project.name,
      description: project.description,
    },
    validationSchema: ProjectSchema,
    onSubmit: (values) => {
      updateProject(
        JSON.stringify({
          ...projectDetailPayload(values),
        })
      )
        .then(() => {
          notify.success(`Project ${values.name} saved.`);
        })
        .catch((e: Error) => {
          notify.failure("Could not save project", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.projects],
          });
        });
    },
  });

  const updateSection = (newItem: string) => {
    setSection(newItem);
  };

  const toggleMenu = () => {
    setConfigOpen((old) => !old);
  };

  return (
    <main className="l-main">
      <div className="p-panel">
        <div className="p-panel__header">
          <h4 className="p-panel__title">Project configuration</h4>
          <div className="p-panel__controls">
            <DeleteProjectBtn project={project} />
          </div>
        </div>
        <div className="p-panel__content edit-project">
          <Form onSubmit={formik.handleSubmit} stacked className="form">
            <ProjectFormMenu
              active={section}
              setActive={updateSection}
              isRestrictions={isConfigOpen}
              toggleRestrictionsOpen={toggleMenu}
            />
            <Row className="form-contents" key={section}>
              <Col size={12}>
                <NotificationRow />
                {section === PROJECT_DETAILS && (
                  <ProjectDetailsForm formik={formik} isCreateMode={false} />
                )}
              </Col>
            </Row>
          </Form>
          <div className="p-bottom-controls">
            <hr />
            <Row className="u-align--right">
              <Col size={12}>
                <SubmitButton
                  isSubmitting={formik.isSubmitting}
                  isDisabled={!formik.isValid || !formik.values.name}
                  buttonLabel="Save changes"
                  onClick={() => void formik.submitForm()}
                />
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EditProjectForm;
