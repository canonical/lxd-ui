import React, { FC } from "react";
import { Navigate, useParams } from "react-router-dom";

const ProjectRedirect: FC = () => {
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  return <Navigate to={`/ui/project/${project}/instances`} replace={true} />;
};

export default ProjectRedirect;
