import { Spinner } from "@canonical/react-components";
import { useCurrentProject } from "context/useCurrentProject";
import NotFound from "components/NotFound";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  outlet: React.JSX.Element;
}

const ProjectLoader = ({ outlet }: Props) => {
  const { project, isLoading } = useCurrentProject();

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  if (!project) {
    const url = location.pathname;
    const hasProjectInUrl = url.startsWith(`${ROOT_PATH}/ui/project/`);
    const project = hasProjectInUrl ? url.split("/")[3] : "default";

    return <NotFound entityType="project" entityName={project} />;
  }

  return outlet;
};

export default ProjectLoader;
