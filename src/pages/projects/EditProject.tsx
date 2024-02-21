import { FC, useEffect } from "react";
import { ActionButton, Button, useNotify } from "@canonical/react-components";
import { updateProject } from "api/projects";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { PROJECT_DETAILS } from "pages/projects/forms/ProjectFormMenu";
import {
  projectDetailPayload,
  projectDetailRestrictionPayload,
} from "pages/projects/forms/ProjectDetailsForm";
import { useFormik } from "formik";
import { ProjectFormValues } from "pages/projects/CreateProject";
import * as Yup from "yup";
import { LxdProject } from "types/project";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { resourceLimitsPayload } from "pages/projects/forms/ProjectResourceLimitsForm";
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
import CustomLayout from "components/CustomLayout";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useNavigate, useParams } from "react-router-dom";
import { slugify } from "util/slugify";
import { useToastNotification } from "context/toastNotificationProvider";
import { useSupportedFeatures } from "context/useSupportedFeatures";

interface Props {
  project: LxdProject;
}

const EditProject: FC<Props> = ({ project }) => {
  const navigate = useNavigate();
  const { isRestricted } = useAuth();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { section } = useParams<{ section?: string }>();
  const { hasProjectsNetworksZones, hasStorageBuckets } =
    useSupportedFeatures();

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
      if (!hasProjectsNetworksZones) {
        values.features_networks_zones = undefined;
      }

      if (!hasStorageBuckets) {
        values.features_storage_buckets = undefined;
      }

      const projectPayload = getPayload(values) as LxdProject;

      projectPayload.etag = project.etag;

      updateProject(projectPayload)
        .then(() => {
          toastNotify.success(`Project ${project.name} updated.`);
          void formik.setFieldValue("readOnly", true);
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

  const setSection = (newSection: string) => {
    const baseUrl = `/ui/project/${project.name}/configuration`;
    newSection === PROJECT_DETAILS
      ? navigate(baseUrl)
      : navigate(`${baseUrl}/${slugify(newSection)}`);
  };

  return (
    <CustomLayout
      header={<ProjectConfigurationHeader project={project} />}
      contentClassName="edit-project"
    >
      <ProjectForm
        formik={formik}
        project={project}
        section={section ?? slugify(PROJECT_DETAILS)}
        updateSection={setSection}
        isEdit={true}
      />
      {!isRestricted && (
        <FormFooterLayout>
          {formik.values.readOnly ? (
            <>
              <Button
                appearance="positive"
                onClick={() => void formik.setFieldValue("readOnly", false)}
              >
                Edit configuration
              </Button>
            </>
          ) : (
            <>
              <Button
                appearance="base"
                onClick={() => formik.setValues(initialValues)}
              >
                Cancel
              </Button>
              <ActionButton
                appearance="positive"
                loading={formik.isSubmitting}
                disabled={!formik.isValid || !formik.values.name}
                onClick={() => void formik.submitForm()}
              >
                Save changes
              </ActionButton>
            </>
          )}
        </FormFooterLayout>
      )}
    </CustomLayout>
  );
};

export default EditProject;
