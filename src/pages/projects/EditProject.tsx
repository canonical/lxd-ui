import { FC, useEffect } from "react";
import { Button, useNotify } from "@canonical/react-components";
import { updateProject } from "api/projects";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { PROJECT_DETAILS } from "pages/projects/forms/ProjectFormMenu";
import { useFormik } from "formik";
import { ProjectFormValues } from "pages/projects/CreateProject";
import * as Yup from "yup";
import { LxdProject } from "types/project";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { getProjectEditValues, getProjectPayload } from "util/projectEdit";
import { FormikProps } from "formik/dist/types";
import ProjectForm from "pages/projects/forms/ProjectForm";
import ProjectConfigurationHeader from "pages/projects/ProjectConfigurationHeader";
import { useAuth } from "context/auth";
import CustomLayout from "components/CustomLayout";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useNavigate, useParams } from "react-router-dom";
import { slugify } from "util/slugify";
import { useToastNotification } from "context/toastNotificationProvider";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import FormSubmitBtn from "components/forms/FormSubmitBtn";

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
    enableReinitialize: true,
    onSubmit: (values) => {
      if (!hasProjectsNetworksZones) {
        values.features_networks_zones = undefined;
      }

      if (!hasStorageBuckets) {
        values.features_storage_buckets = undefined;
      }

      const projectPayload = getProjectPayload(project, values) as LxdProject;

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
          {formik.values.readOnly ? null : (
            <>
              <Button
                appearance="base"
                onClick={() => formik.setValues(initialValues)}
              >
                Cancel
              </Button>
              <FormSubmitBtn formik={formik} disabled={!formik.values.name} />
            </>
          )}
        </FormFooterLayout>
      )}
    </CustomLayout>
  );
};

export default EditProject;
