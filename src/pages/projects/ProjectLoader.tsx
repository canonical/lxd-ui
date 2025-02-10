import Loader from "components/Loader";
import { useProject } from "context/project";
import NoProject from "components/NoProject";

interface Props {
  outlet: React.JSX.Element;
}

const ProjectLoader = ({ outlet }: Props) => {
  const { project, isLoading } = useProject();

  if (isLoading) {
    return <Loader />;
  }

  if (!project) {
    return <NoProject />;
  }

  return outlet;
};

export default ProjectLoader;
