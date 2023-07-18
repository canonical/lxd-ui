import React, { FC, useEffect, useState } from "react";
import { Button, Col, Row, useNotify } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import SubmitButton from "components/SubmitButton";
import { checkDuplicateName } from "util/helpers";
import { useNavigate } from "react-router-dom";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { createProject } from "api/projects";
import { PROJECT_DETAILS } from "pages/projects/forms/ProjectFormMenu";
import {
  projectDetailPayload,
  projectDetailRestrictionPayload,
  ProjectDetailsFormValues,
} from "pages/projects/forms/ProjectDetailsForm";
import {
  ResourceLimitsFormValues,
  resourceLimitsPayload,
} from "pages/projects/forms/ResourceLimitsForm";
import {
  ClusterRestrictionFormValues,
  clusterRestrictionPayload,
} from "pages/projects/forms/ClusterRestrictionForm";
import {
  InstanceRestrictionFormValues,
  instanceRestrictionPayload,
} from "pages/projects/forms/InstanceRestrictionForm";
import {
  DeviceUsageRestrictionFormValues,
  deviceUsageRestrictionPayload,
} from "pages/projects/forms/DeviceUsageRestrictionForm";
import {
  NetworkRestrictionFormValues,
  networkRestrictionPayload,
} from "pages/projects/forms/NetworkRestrictionForm";
import ProjectForm from "pages/projects/forms/ProjectForm";

export type ProjectFormValues = ProjectDetailsFormValues &
  ResourceLimitsFormValues &
  ClusterRestrictionFormValues &
  InstanceRestrictionFormValues &
  DeviceUsageRestrictionFormValues &
  NetworkRestrictionFormValues;

const CreateProjectForm: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const [section, setSection] = useState(PROJECT_DETAILS);

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

  const formik = useFormik<ProjectFormValues>({
    initialValues: {
      name: "",
      restricted: false,
      readOnly: false,
      type: "project",
    },
    validationSchema: ProjectSchema,
    onSubmit: (values) => {
      const restrictions = values.restricted
        ? {
            ...clusterRestrictionPayload(values),
            ...instanceRestrictionPayload(values),
            ...deviceUsageRestrictionPayload(values),
            ...networkRestrictionPayload(values),
          }
        : {};

      createProject(
        JSON.stringify({
          ...projectDetailPayload(values),
          config: {
            ...projectDetailRestrictionPayload(values),
            ...resourceLimitsPayload(values),
            ...restrictions,
          },
        })
      )
        .then(() => {
          navigate(
            `/ui/project/${values.name}/instances`,
            notify.queue(notify.success(`Project ${values.name} created.`))
          );
        })
        .catch((e: Error) => {
          notify.failure("Project creation failed", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.projects],
          });
        });
    },
  });

  return (
    <main className="l-main">
      <div className="p-panel">
        <div className="p-panel__header">
          <h4 className="p-panel__title">Create a project</h4>
        </div>
        <div className="p-panel__content create-project">
          <ProjectForm
            formik={formik}
            section={section}
            updateSection={setSection}
            isEdit={false}
          />
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
