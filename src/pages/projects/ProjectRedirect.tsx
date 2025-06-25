import type { FC } from "react";
import { Navigate, useParams } from "react-router-dom";

const ProjectRedirect: FC = () => {
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  return (
    <Navigate
      to={`/ui/project/${encodeURIComponent(project)}/instances`}
      replace={true}
    />
  );
};

export default ProjectRedirect;
