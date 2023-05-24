import React, { FC } from "react";
import { useParams } from "react-router-dom";
import EditProjectForm from "pages/projects/EditProjectForm";
import Loader from "components/Loader";
import { useProject } from "context/project";

const ProjectConfiguration: FC = () => {
  const { project: projectName } = useParams<{ project: string }>();

  if (!projectName) {
    return <>Missing project</>;
  }

  const { project, isLoading } = useProject();

  if (isLoading) {
    return <Loader />;
  }

  return project ? (
    <EditProjectForm project={project} key={project.name} />
  ) : (
    <>Loading project failed</>
  );
};

export default ProjectConfiguration;
