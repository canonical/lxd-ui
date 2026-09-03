import type { FC } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useFeatureFlags } from "context/useFeatureFlags";
import { getHomeUrl } from "util/projects";

const ProjectRedirect: FC = () => {
  const { project } = useParams<{ project: string }>();
  const { isOverviewEnabled } = useFeatureFlags();

  if (!project) {
    return <>Missing project</>;
  }

  return (
    <Navigate to={getHomeUrl(project, isOverviewEnabled())} replace={true} />
  );
};

export default ProjectRedirect;
