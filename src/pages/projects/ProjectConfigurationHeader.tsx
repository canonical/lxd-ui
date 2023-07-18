import React, { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import RenameHeader, { RenameHeaderValues } from "components/RenameHeader";
import { LxdProject } from "types/project";
import { renameProject } from "api/projects";
import * as Yup from "yup";
import { useFormik } from "formik";
import { checkDuplicateName } from "util/helpers";
import DeleteProjectBtn from "./actions/DeleteProjectBtn";
import { useNotify } from "@canonical/react-components";

interface Props {
  project: LxdProject;
}

const ProjectConfigurationHeader: FC<Props> = ({ project }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const controllerState = useState<AbortController | null>(null);

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "A project with this name already exists",
        (value) =>
          project.name === value ||
          checkDuplicateName(value, "", controllerState, "projects")
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
        void formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      renameProject(project.name, values.name)
        .then(() => {
          navigate(
            `/ui/project/${values.name}/configuration`,
            notify.queue(notify.success("Project renamed."))
          );
          void formik.setFieldValue("isRenaming", false);
        })
        .catch((e) => {
          notify.failure("Renaming failed", e);
        })
        .finally(() => formik.setSubmitting(false));
    },
  });

  return (
    <RenameHeader
      name={project.name}
      parentItem="Project configuration"
      renameDisabledReason={
        project.name === "default"
          ? "Cannot rename the default project"
          : undefined
      }
      controls={<DeleteProjectBtn project={project} />}
      isLoaded={Boolean(project)}
      formik={formik}
    />
  );
};

export default ProjectConfigurationHeader;
