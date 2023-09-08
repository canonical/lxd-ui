import React, { FC, useEffect, useState } from "react";
import { Button, Col, Row, useNotify } from "@canonical/react-components";
import { updateProject } from "api/projects";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { PROJECT_DETAILS } from "pages/projects/forms/ProjectFormMenu";
import {
  projectDetailPayload,
  projectDetailRestrictionPayload,
} from "pages/projects/forms/ProjectDetailsForm";
import SubmitButton from "components/SubmitButton";
import { useFormik } from "formik";
import { ProjectFormValues } from "pages/projects/CreateProjectForm";
import * as Yup from "yup";
import { LxdProject } from "types/project";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { resourceLimitsPayload } from "pages/projects/forms/ResourceLimitsForm";
import { clusterRestrictionPayload } from "pages/projects/forms/ClusterRestrictionForm";
import { instanceRestrictionPayload } from "pages/projects/forms/InstanceRestrictionForm";
import { deviceUsageRestrictionPayload } from "pages/projects/forms/DeviceUsageRestrictionForm";
import { networkRestrictionPayload } from "pages/projects/forms/NetworkRestrictionForm";
import { getProjectEditValues } from "util/projectEdit";
import { FormikProps } from "formik/dist/types";
import ProjectForm from "pages/projects/forms/ProjectForm";
import { getUnhandledKeyValues } from "util/formFields";
import { getProjectConfigKeys } from "util/projectConfigFields";
import ProjectConfigurationHeader from "pages/projects/ProjectConfigurationHeader";
import { useAuth } from "context/auth";

interface Props {
  project: LxdProject;
}

const EditProjectForm: FC<Props> = ({ project }) => {
  const { isRestricted } = useAuth();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [section, setSection] = useState(PROJECT_DETAILS);

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useEventListener("resize", updateFormHeight);

  const ProjectSchema = Yup.object().shape({
    name: Yup.string().required(),
  });

  const initialValues = getProjectEditValues(project);

  const formik: FormikProps<ProjectFormValues> = useFormik({
    initialValues: initialValues,
    validationSchema: ProjectSchema,
    onSubmit: (values) => {
      const projectPayload = getPayload(values) as LxdProject;

      projectPayload.etag = project.etag;

      updateProject(projectPayload)
        .then(() => {
          notify.success(`Project updated.`);
          formik.setFieldValue("readOnly", true);
        })
        .catch((e: Error) => {
          notify.failure("Project update failed", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.projects],
          });
        });
    },
  });

  const getPayload = (values: ProjectFormValues) => {
    const handledConfigKeys = getProjectConfigKeys();
    const handledKeys = new Set(["name", "description", "config"]);

    return {
      ...projectDetailPayload(values),
      config: {
        ...projectDetailRestrictionPayload(values),
        ...resourceLimitsPayload(values),
        ...(values.restricted
          ? {
              ...clusterRestrictionPayload(values),
              ...instanceRestrictionPayload(values),
              ...deviceUsageRestrictionPayload(values),
              ...networkRestrictionPayload(values),
            }
          : {}),
        ...getUnhandledKeyValues(project.config, handledConfigKeys),
      },
      ...getUnhandledKeyValues(project, handledKeys),
    };
  };

  return (
    <main className="l-main">
      <div className="p-panel">
        <ProjectConfigurationHeader project={project} />
        <div className="p-panel__content edit-project">
          <ProjectForm
            formik={formik}
            project={project}
            section={section}
            updateSection={setSection}
            isEdit={true}
          />
          {!isRestricted && (
            <div className="p-bottom-controls">
              <hr />
              <Row>
                <Col size={12} className="u-align--right">
                  {formik.values.readOnly ? (
                    <>
                      <Button
                        appearance="positive"
                        onClick={() => formik.setFieldValue("readOnly", false)}
                      >
                        Edit configuration
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => formik.setValues(initialValues)}>
                        Cancel
                      </Button>
                      <SubmitButton
                        isSubmitting={formik.isSubmitting}
                        isDisabled={!formik.isValid || !formik.values.name}
                        buttonLabel="Save changes"
                        onClick={() => void formik.submitForm()}
                      />
                    </>
                  )}
                </Col>
              </Row>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default EditProjectForm;
