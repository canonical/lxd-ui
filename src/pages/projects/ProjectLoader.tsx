import Loader from "components/Loader";
import { useCurrentProject } from "context/useCurrentProject";
import ProjectNotFound from "components/ProjectNotFound";

interface Props {
  outlet: React.JSX.Element;
}

const ProjectLoader = ({ outlet }: Props) => {
  const { project, isLoading } = useCurrentProject();

  if (isLoading) {
    return <Loader isMainComponent />;
  }

  if (!project) {
    return <ProjectNotFound />;
  }

  return outlet;
};

export default ProjectLoader;
