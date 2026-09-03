import type { FC } from "react";
import { useParams } from "react-router-dom";
import EditProject from "pages/projects/EditProject";
import { Spinner } from "@canonical/react-components";
import { useProject } from "context/useProjects";

const ProjectConfiguration: FC = () => {
  const { project: projectName } = useParams<{ project: string }>();

  if (!projectName) {
    return <>Missing project</>;
  }

  const { data: project, isLoading } = useProject(projectName);

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  return project ? (
    <EditProject project={project} key={project.name} />
  ) : (
    <>Loading project failed</>
  );
};

export default ProjectConfiguration;
