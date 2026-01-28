import type { FC } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ROOT_PATH } from "util/rootPath";

const ProjectRedirect: FC = () => {
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  return (
    <Navigate
      to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/instances`}
      replace={true}
    />
  );
};

export default ProjectRedirect;
