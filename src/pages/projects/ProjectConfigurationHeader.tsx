import React, { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import RenameHeader from "components/RenameHeader";
import { useNotify } from "context/notify";
import { LxdProject } from "types/project";
import { renameProject } from "api/projects";

interface Props {
  project: LxdProject;
}

const ProjectConfigurationHeader: FC<Props> = ({ project }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const [isSubmitting, setSubmitting] = useState(false);

  const handleRename = (newName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (project.name === newName) {
        return resolve();
      }
      setSubmitting(true);
      renameProject(project.name, newName)
        .then(() => {
          navigate(
            `/ui/${newName}/configuration`,
            notify.queue(notify.success("Project renamed."))
          );
          return resolve();
        })
        .catch((e) => {
          notify.failure("Renaming failed", e);
          reject();
        })
        .finally(() => setSubmitting(false));
    });
  };

  return (
    <RenameHeader
      name={project.name}
      parentItem="Project configuration"
      renameDisabledReason={
        project.name === "default"
          ? "Cannot rename the default project"
          : undefined
      }
      isLoaded={Boolean(project)}
      onRename={handleRename}
      isRenaming={isSubmitting}
    />
  );
};

export default ProjectConfigurationHeader;
