import type { FC } from "react";
import { Link } from "react-router-dom";
import { Card, Icon, Spinner } from "@canonical/react-components";
import ProjectTable from "pages/overview/ProjectTable";
import { useCurrentProject } from "context/useCurrentProject";
import { useProjects } from "context/useProjects";
import ProjectExplanationTooltip from "pages/projects/ProjectExplanationTooltip";
import { ALL_INSTANCES_LIST_URL } from "util/instances";
import {
  ALL_PROJECTS,
  ALL_PROJECTS_OVERVIEW_PATH,
  getInstancesUrl,
} from "util/projects";

const ProjectsCard: FC = () => {
  const { project: currentProject, projectName } = useCurrentProject();
  const isAllProjects = projectName === ALL_PROJECTS;
  const { data: allProjects = [], error, isLoading } = useProjects();
  const projects = isAllProjects
    ? allProjects
    : currentProject
      ? [currentProject]
      : [];
  const cardClassName = "overview-card projects";
  const cardTitle = (
    <>
      <span className="overview-card-title">
        <Icon name="folder" /> {isAllProjects ? "Projects" : "Project"}
        {!isLoading &&
          !error &&
          isAllProjects &&
          projects.length > 0 &&
          ` (${projects.length})`}
      </span>
      <ProjectExplanationTooltip />
    </>
  );

  if (isLoading) {
    return (
      <Card className={cardClassName} title={cardTitle}>
        <Spinner className="u-loader" text="Loading projects..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cardClassName} title={cardTitle}>
        <div className="error-message">
          <Icon name="error" className="margin-right--large" /> Error while
          loading projects: {error.message}
        </div>
      </Card>
    );
  }

  return (
    <Card className={cardClassName} title={cardTitle}>
      <ProjectTable projects={projects} isAllProjects={isAllProjects} />

      <div className="card-footer">
        {isAllProjects ? (
          <Link to={ALL_INSTANCES_LIST_URL}>All instances list</Link>
        ) : (
          <>
            {allProjects.length > 1 && (
              <Link to={ALL_PROJECTS_OVERVIEW_PATH}>Show all projects</Link>
            )}
            <Link to={getInstancesUrl(projectName)}>
              Project instances list
            </Link>
          </>
        )}
      </div>
    </Card>
  );
};

export default ProjectsCard;
