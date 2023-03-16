import React, { FC } from "react";
import { fetchProject } from "api/projects";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNotify } from "context/notify";
import { useParams } from "react-router-dom";
import EditProjectForm from "pages/projects/EditProjectForm";
import Loader from "components/Loader";

const ProjectConfiguration: FC = () => {
  const notify = useNotify();
  const { project: projectName } = useParams<{ project: string }>();

  if (!projectName) {
    return <>Missing project</>;
  }

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: [queryKeys.projects, projectName],
    queryFn: () => fetchProject(projectName),
  });

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    notify.failure("Could not load project details.", error);
  }

  return project ? (
    <EditProjectForm project={project} key={project.name} />
  ) : (
    <>Could not load project</>
  );
};

export default ProjectConfiguration;
