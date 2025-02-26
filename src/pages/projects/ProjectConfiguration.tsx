import type { FC } from "react";
import { useParams } from "react-router-dom";
import EditProject from "pages/projects/EditProject";
import Loader from "components/Loader";
import { useCurrentProject } from "context/useCurrentProject";

const ProjectConfiguration: FC = () => {
  const { project: projectName } = useParams<{ project: string }>();

  if (!projectName) {
    return <>Missing project</>;
  }

  const { project, isLoading } = useCurrentProject();

  if (isLoading) {
    return <Loader />;
  }

  return project ? (
    <EditProject project={project} key={project.name} />
  ) : (
    <>Loading project failed</>
  );
};

export default ProjectConfiguration;
