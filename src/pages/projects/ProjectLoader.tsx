import React from "react";
import Loader from "components/Loader";
import NoMatch from "components/NoMatch";
import { useProject } from "context/project";

interface Props {
  outlet: JSX.Element;
}

const ProjectLoader = ({ outlet }: Props) => {
  const { project, isLoading } = useProject();

  if (isLoading) {
    return <Loader />;
  }

  if (!project) {
    return <NoMatch />;
  }

  return outlet;
};

export default ProjectLoader;
