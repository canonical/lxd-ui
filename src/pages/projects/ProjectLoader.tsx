import { Spinner } from "@canonical/react-components";
import { useCurrentProject } from "context/useCurrentProject";
import ProjectNotFound from "components/ProjectNotFound";

interface Props {
  outlet: React.JSX.Element;
}

const ProjectLoader = ({ outlet }: Props) => {
  const { project, isLoading } = useCurrentProject();

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  if (!project) {
    return <ProjectNotFound />;
  }

  return outlet;
};

export default ProjectLoader;
