import Loader from "components/Loader";
import { useCurrentProject } from "context/useCurrentProject";
import NoProject from "components/NoProject";

interface Props {
  outlet: React.JSX.Element;
}

const ProjectLoader = ({ outlet }: Props) => {
  const { project, isLoading } = useCurrentProject();

  if (isLoading) {
    return <Loader isMainComponent />;
  }

  if (!project) {
    return <NoProject />;
  }

  return outlet;
};

export default ProjectLoader;
