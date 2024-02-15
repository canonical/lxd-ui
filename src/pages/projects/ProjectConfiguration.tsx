import { FC } from "react";
import { useParams } from "react-router-dom";
import EditProject from "pages/projects/EditProject";
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
    <EditProject project={project} key={project.name} />
  ) : (
    <>Loading project failed</>
  );
};

export default ProjectConfiguration;
