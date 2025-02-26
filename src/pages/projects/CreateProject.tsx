import type { FC } from "react";
import { useEffect, useState } from "react";
import { ActionButton, Button, useNotify } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { checkDuplicateName, getDefaultStoragePool } from "util/helpers";
import { useNavigate } from "react-router-dom";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "util/useEventListener";
import { createProject } from "api/projects";
import { PROJECT_DETAILS } from "pages/projects/forms/ProjectFormMenu";
import type { ProjectDetailsFormValues } from "pages/projects/forms/ProjectDetailsForm";
import {
  projectDetailPayload,
  projectDetailRestrictionPayload,
} from "pages/projects/forms/ProjectDetailsForm";
import type { ProjectResourceLimitsFormValues } from "pages/projects/forms/ProjectResourceLimitsForm";
import { resourceLimitsPayload } from "pages/projects/forms/ProjectResourceLimitsForm";
import type { ClusterRestrictionFormValues } from "pages/projects/forms/ClusterRestrictionForm";
import { clusterRestrictionPayload } from "pages/projects/forms/ClusterRestrictionForm";
import type { InstanceRestrictionFormValues } from "pages/projects/forms/InstanceRestrictionForm";
import { instanceRestrictionPayload } from "pages/projects/forms/InstanceRestrictionForm";
import type { DeviceUsageRestrictionFormValues } from "pages/projects/forms/DeviceUsageRestrictionForm";
import { deviceUsageRestrictionPayload } from "pages/projects/forms/DeviceUsageRestrictionForm";
import type { NetworkRestrictionFormValues } from "pages/projects/forms/NetworkRestrictionForm";
import { networkRestrictionPayload } from "pages/projects/forms/NetworkRestrictionForm";
import ProjectForm from "pages/projects/forms/ProjectForm";
import BaseLayout from "components/BaseLayout";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { slugify } from "util/slugify";
import { useToastNotification } from "context/toastNotificationProvider";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import ResourceLink from "components/ResourceLink";
import { fetchProfile, updateProfile } from "api/profiles";
import { useProfile } from "context/useProfiles";
import { useAuth } from "context/auth";

export type ProjectFormValues = ProjectDetailsFormValues &
  ProjectResourceLimitsFormValues &
  ClusterRestrictionFormValues &
  InstanceRestrictionFormValues &
  DeviceUsageRestrictionFormValues &
  NetworkRestrictionFormValues;

const CreateProject: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const [section, setSection] = useState(slugify(PROJECT_DETAILS));
  const { hasProjectsNetworksZones, hasStorageBuckets } =
    useSupportedFeatures();
  const { isFineGrained } = useAuth();

  const { data: defaultProjectDefaultProfile } = useProfile(
    "default",
    "default",
  );

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

  const notifySuccess = (values: ProjectFormValues) => {
    navigate(`/ui/project/${values.name}/instances`);
    toastNotify.success(
      <>
        Project{" "}
        <ResourceLink
          type="project"
          value={values.name}
          to={`/ui/project/${values.name}/instances`}
        />{" "}
        created.
      </>,
    );
  };

  const formik = useFormik<ProjectFormValues>({
    initialValues: {
      name: "",
      restricted: false,
      readOnly: false,
      entityType: "project",
      default_instance_storage_pool: defaultProjectDefaultProfile
        ? getDefaultStoragePool(defaultProjectDefaultProfile)
        : "",
    },
    enableReinitialize: true,
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

      if (!hasProjectsNetworksZones) {
        values.features_networks_zones = undefined;
      }

      if (!hasStorageBuckets) {
        values.features_storage_buckets = undefined;
      }

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
        .then(async () => {
          if (
            !values.default_instance_storage_pool ||
            values.features_profiles === false
          ) {
            notifySuccess(values);
            return;
          }
          const profile = await fetchProfile(
            "default",
            values.name,
            isFineGrained,
          );
          profile.devices = {
            root: {
              path: "/",
              pool: values.default_instance_storage_pool,
              type: "disk",
            },
          };

          updateProfile(profile, values.name)
            .then(() => {
              notifySuccess(values);
            })
            .catch((e: Error) => {
              navigate(`/ui/project/${values.name}/instances`);
              toastNotify.failure(
                `Successfully created ${profile.name}, Failed to attach storage pool`,
                e,
              );
            });
        })
        .catch((e: Error) => {
          formik.setSubmitting(false);
          notify.failure("Project creation failed", e);
        })
        .finally(() => {
          queryClient.invalidateQueries({
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
        <ActionButton
          appearance="positive"
          loading={formik.isSubmitting}
          disabled={!formik.isValid || !formik.values.name}
          onClick={() => void formik.submitForm()}
        >
          Create
        </ActionButton>
      </FormFooterLayout>
    </BaseLayout>
  );
};

export default CreateProject;
