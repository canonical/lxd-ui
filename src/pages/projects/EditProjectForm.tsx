import React, { FC, useEffect, useState } from "react";
import { Button, Col, Form, Row } from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import { updateProject } from "api/projects";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNotify } from "context/notify";
import DeleteProjectBtn from "pages/projects/actions/DeleteProjectBtn";
import ProjectFormMenu, {
  CLUSTERS,
  DEVICE_USAGE,
  INSTANCES,
  NETWORKS,
  PROJECT_DETAILS,
  RESOURCE_LIMITS,
} from "pages/projects/forms/ProjectFormMenu";
import ProjectDetailsForm, {
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
import ResourceLimitsForm, {
  resourceLimitsPayload,
} from "pages/projects/forms/ResourceLimitsForm";
import ClusterRestrictionForm, {
  clusterRestrictionPayload,
} from "pages/projects/forms/ClusterRestrictionForm";
import InstanceRestrictionForm, {
  instanceRestrictionPayload,
} from "pages/projects/forms/InstanceRestrictionForm";
import DeviceUsageRestrictionForm, {
  deviceUsageRestrictionPayload,
} from "pages/projects/forms/DeviceUsageRestrictionForm";
import NetworkRestrictionForm, {
  networkRestrictionPayload,
} from "pages/projects/forms/NetworkRestrictionForm";
import classnames from "classnames";
import { getProjectEditValues } from "util/projectEdit";
import { FormikProps } from "formik/dist/types";

interface Props {
  project: LxdProject;
}

const EditProjectForm: FC<Props> = ({ project }) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [section, setSection] = useState(PROJECT_DETAILS);
  const [isRestrictionsOpen, setRestrictionsOpen] = useState(false);

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

  const updateSection = (newItem: string) => {
    setSection(newItem);
  };

  const toggleMenu = () => {
    setRestrictionsOpen((old) => !old);
  };

  return (
    <main className="l-main">
      <div className="p-panel">
        <div className="p-panel__header">
          <h4 className="p-panel__title">Project configuration</h4>
        </div>
        <div className="p-panel__content edit-project">
          <Form onSubmit={formik.handleSubmit} stacked className="form">
            <ProjectFormMenu
              active={section}
              setActive={updateSection}
              isRestrictionsOpen={
                isRestrictionsOpen && formik.values.restricted
              }
              isRestrictionsDisabled={!formik.values.restricted}
              toggleRestrictionsOpen={toggleMenu}
            />
            <Row className="form-contents" key={section}>
              <Col size={12}>
                <NotificationRow />
                {section === PROJECT_DETAILS && (
                  <ProjectDetailsForm formik={formik} />
                )}
                {section === RESOURCE_LIMITS && (
                  <ResourceLimitsForm formik={formik} />
                )}
                {section === CLUSTERS && (
                  <ClusterRestrictionForm formik={formik} />
                )}
                {section === INSTANCES && (
                  <InstanceRestrictionForm formik={formik} />
                )}
                {section === DEVICE_USAGE && (
                  <DeviceUsageRestrictionForm formik={formik} />
                )}
                {section === NETWORKS && (
                  <NetworkRestrictionForm formik={formik} />
                )}
              </Col>
            </Row>
          </Form>
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
