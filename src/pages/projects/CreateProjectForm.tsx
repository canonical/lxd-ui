import React, { FC, useEffect, useState } from "react";
import { Button, Col, Form, Row } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import NotificationRow from "components/NotificationRow";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import SubmitButton from "components/SubmitButton";
import { checkDuplicateName } from "util/helpers";
import { useNavigate } from "react-router-dom";
import { useNotify } from "context/notify";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { createProject } from "api/projects";
import ProjectFormMenu, {
  PROJECT_DETAILS,
} from "pages/projects/forms/ProjectFormMenu";
import ProjectDetailsForm, {
  projectDetailPayload,
  ProjectDetailsFormValues,
} from "pages/projects/forms/ProjectDetailsForm";

export type CreateProjectFormValues = ProjectDetailsFormValues;

const CreateProjectForm: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const [section, setSection] = useState(PROJECT_DETAILS);
  const [isConfigOpen, setConfigOpen] = useState(false);

  const ProjectSchema = Yup.object().shape({
    name: Yup.string()
      .test("deduplicate", "A project with this name already exists", (value) =>
        checkDuplicateName(value, "", controllerState, "projects")
      )
      .required(),
  });

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useEventListener("resize", updateFormHeight);

  const formik = useFormik<CreateProjectFormValues>({
    initialValues: {
      name: "",
    },
    validationSchema: ProjectSchema,
    onSubmit: (values) => {
      createProject(
        JSON.stringify({
          ...projectDetailPayload(values),
        })
      )
        .then(() => {
          navigate(
            `/ui/${values.name}/instances`,
            notify.queue(notify.success(`Project ${values.name} created.`))
          );
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
          <h4 className="p-panel__title">Create a project</h4>
        </div>
        <div className="p-panel__content create-project">
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
                  <ProjectDetailsForm formik={formik} isCreateMode={true} />
                )}
              </Col>
            </Row>
          </Form>
          <div className="p-bottom-controls">
            <hr />
            <Row className="u-align--right">
              <Col size={12}>
                <Button appearance="base" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <SubmitButton
                  isSubmitting={formik.isSubmitting}
                  isDisabled={!formik.isValid || !formik.values.name}
                  buttonLabel="Create"
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

export default CreateProjectForm;
