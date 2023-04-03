import React, { FC, useEffect, useState } from "react";
import { Button, Col, Row } from "@canonical/react-components";
import { updateProject } from "api/projects";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNotify } from "context/notify";
import DeleteProjectBtn from "pages/projects/actions/DeleteProjectBtn";
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
import classnames from "classnames";
import { getProjectEditValues } from "util/projectEdit";
import { FormikProps } from "formik/dist/types";
import ProjectForm from "pages/projects/forms/ProjectForm";

interface Props {
  project: LxdProject;
}

const EditProjectForm: FC<Props> = ({ project }) => {
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
      const restrictions = values.restricted
        ? {
            ...clusterRestrictionPayload(values),
            ...instanceRestrictionPayload(values),
            ...deviceUsageRestrictionPayload(values),
            ...networkRestrictionPayload(values),
          }
        : {};
      const projectPayload = {
        ...projectDetailPayload(values),
        config: {
          ...projectDetailRestrictionPayload(values),
          ...resourceLimitsPayload(values),
          ...restrictions,
        },
      } as LxdProject;

      projectPayload.etag = project.etag;

      updateProject(projectPayload)
        .then(() => {
          notify.success(`Project updated.`);
          formik.setFieldValue("readOnly", true);
        })
        .catch((e: Error) => {
          notify.failure("", e, undefined, "Project update failed");
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
          <h4 className="p-panel__title">Project configuration</h4>
        </div>
        <div className="p-panel__content edit-project">
          <ProjectForm
            formik={formik}
            section={section}
            updateSection={setSection}
          />
          <div className="p-bottom-controls">
            <hr />
            <Row>
              <Col
                size={12}
                className={classnames({
                  "u-align--right": !formik.values.readOnly,
                  "u-space-between": formik.values.readOnly,
                })}
              >
                {formik.values.readOnly ? (
                  <>
                    <DeleteProjectBtn project={project} />
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
        </div>
      </div>
    </main>
  );
};

export default EditProjectForm;
