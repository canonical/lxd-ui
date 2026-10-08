import type { FC } from "react";
import { Navigate, useParams } from "react-router-dom";
import { getOverviewUrl } from "util/projects";

const ProjectRedirect: FC = () => {
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  return <Navigate to={getOverviewUrl(project)} replace={true} />;
};

export default ProjectRedirect;
