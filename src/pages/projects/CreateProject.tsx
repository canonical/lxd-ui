import React, { FC, useEffect, useState } from "react";
import { Button, success, useNotify } from "@canonical/react-components";
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
  ProjectResourceLimitsFormValues,
  resourceLimitsPayload,
} from "pages/projects/forms/ProjectResourceLimitsForm";
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
import BaseLayout from "components/BaseLayout";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { slugify } from "util/slugify";

export type ProjectFormValues = ProjectDetailsFormValues &
  ProjectResourceLimitsFormValues &
  ClusterRestrictionFormValues &
  InstanceRestrictionFormValues &
  DeviceUsageRestrictionFormValues &
  NetworkRestrictionFormValues;

const CreateProject: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const [section, setSection] = useState(slugify(PROJECT_DETAILS));

  const ProjectSchema = Yup.object().shape({
    name: Yup.string()
      .test("deduplicate", "A project with this name already exists", (value) =>
        checkDuplicateName(value, "", controllerState, "projects"),
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
      entityType: "project",
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
        }),
      )
        .then(() => {
          navigate(
            `/ui/project/${values.name}/instances`,
            notify.queue(success(`Project ${values.name} created.`)),
          );
        })
        .catch((e: Error) => {
          formik.setSubmitting(false);
          notify.failure("Project creation failed", e);
        })
        .finally(() => {
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.projects],
          });
        });
    },
  });

  return (
    <BaseLayout title="Create a project" contentClassName="create-project">
      <ProjectForm
        formik={formik}
        section={section}
        updateSection={(newSection: string) => setSection(slugify(newSection))}
        isEdit={false}
      />
      <FormFooterLayout>
        <Button appearance="base" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <SubmitButton
          isSubmitting={formik.isSubmitting}
          isDisabled={!formik.isValid || !formik.values.name}
          buttonLabel="Create"
          onClick={() => void formik.submitForm()}
        />
      </FormFooterLayout>
    </BaseLayout>
  );
};

export default CreateProject;
