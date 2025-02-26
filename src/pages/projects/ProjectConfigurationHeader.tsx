import type { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { RenameHeaderValues } from "components/RenameHeader";
import RenameHeader from "components/RenameHeader";
import type { LxdProject } from "types/project";
import { renameProject } from "api/projects";
import * as Yup from "yup";
import { useFormik } from "formik";
import { checkDuplicateName } from "util/helpers";
import DeleteProjectBtn from "./actions/DeleteProjectBtn";
import HelpLink from "components/HelpLink";
import { useEventQueue } from "context/eventQueue";
import { useDocs } from "context/useDocs";
import { useToastNotification } from "context/toastNotificationProvider";
import ResourceLink from "components/ResourceLink";
import { useProjectEntitlements } from "util/entitlements/projects";

interface Props {
  project: LxdProject;
}

const ProjectConfigurationHeader: FC<Props> = ({ project }) => {
  const docBaseLink = useDocs();
  const eventQueue = useEventQueue();
  const navigate = useNavigate();
  const toastNotify = useToastNotification();
  const controllerState = useState<AbortController | null>(null);
  const { canEditProject } = useProjectEntitlements();

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "A project with this name already exists",
        async (value) =>
          project.name === value ||
          checkDuplicateName(value, "", controllerState, "projects"),
      )
      .required("Project name is required"),
  });

  const formik = useFormik<RenameHeaderValues>({
    initialValues: {
      name: project.name,
      isRenaming: false,
    },
    validationSchema: RenameSchema,
    onSubmit: (values) => {
      if (project.name === values.name) {
        formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      const oldProjectLink = (
        <ResourceLink
          type="project"
          value={values.name}
          to={`/ui/project/${project.name}/configuration`}
        />
      );
      renameProject(project.name, values.name)
        .then((operation) => {
          eventQueue.set(
            operation.metadata.id,
            () => {
              const url = `/ui/project/${values.name}/configuration`;
              navigate(url);
              toastNotify.success(
                <>
                  Project <strong>{project.name}</strong> renamed to{" "}
                  <ResourceLink type="project" value={values.name} to={url} />.
                </>,
              );
              formik.setFieldValue("isRenaming", false);
            },
            (msg) =>
              toastNotify.failure(
                `Renaming project ${project.name} failed`,
                new Error(msg),
                oldProjectLink,
              ),
            () => {
              formik.setSubmitting(false);
            },
          );
        })
        .catch((e) => {
          formik.setSubmitting(false);
          toastNotify.failure(
            `Renaming project ${project.name} failed`,
            e,
            oldProjectLink,
          );
        });
    },
  });

  const getRenameDisabledReason = () => {
    if (!canEditProject(project)) {
      return "You do not have permission to rename this project";
    }

    if (project.name === "default") {
      return "Cannot rename the default project";
    }

    return undefined;
  };

  return (
    <RenameHeader
      name={project.name}
      parentItems={[
        <HelpLink
          key="project-configuration"
          href={`${docBaseLink}/reference/projects/`}
          title="Learn more about project configuration"
        >
          Project configuration
        </HelpLink>,
      ]}
      renameDisabledReason={getRenameDisabledReason()}
      controls={<DeleteProjectBtn project={project} />}
      isLoaded={Boolean(project)}
      formik={formik}
    />
  );
};

export default ProjectConfigurationHeader;
