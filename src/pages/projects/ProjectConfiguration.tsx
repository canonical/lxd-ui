import type { FC } from "react";
import { useParams } from "react-router-dom";
import EditProject from "pages/projects/EditProject";
import { Spinner } from "@canonical/react-components";
import { useCurrentProject } from "context/useCurrentProject";

const ProjectConfiguration: FC = () => {
  const { project: projectName } = useParams<{ project: string }>();

  if (!projectName) {
    return <>Missing project</>;
  }

  const { project, isLoading } = useCurrentProject();

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
