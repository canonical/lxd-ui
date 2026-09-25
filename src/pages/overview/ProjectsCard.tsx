import type { FC, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card, Icon, Spinner } from "@canonical/react-components";
import Breadcrumb from "components/Breadcrumb";
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
      <div className="overview-card-title">
        <Icon name="folder" aria-hidden="true" />
        <span className={isAllProjects ? undefined : "u-off-screen"}>
          {isAllProjects ? (
            <>
              All projects
              {!isLoading &&
                !error &&
                projects.length > 0 &&
                ` (${projects.length})`}
            </>
          ) : (
            "Projects"
          )}
        </span>
      </div>
      <ProjectExplanationTooltip />
    </>
  );
  const projectBreadcrumb = !isAllProjects && (
    <Breadcrumb className="projects-breadcrumb">
      <li className="u-no-margin--bottom continuous-breadcrumb p-heading--3">
        <Link to={ALL_PROJECTS_OVERVIEW_PATH}>All projects</Link>
      </li>
      <li className="u-no-margin--bottom continuous-breadcrumb p-heading--3">
        {projectName}
      </li>
    </Breadcrumb>
  );

  const renderCard = (content: ReactNode) => (
    <div className="projects-card">
      {projectBreadcrumb}
      <Card className={cardClassName} title={cardTitle}>
        {content}
      </Card>
    </div>
  );

  if (isLoading) {
    return renderCard(
      <Spinner className="u-loader" text="Loading projects..." />,
    );
  }

  if (error) {
    return renderCard(
      <div className="error-message">
        <Icon name="error" className="margin-right--large" /> Error while
        loading projects: {error.message}
      </div>,
    );
  }

  return renderCard(
    <>
      <ProjectTable projects={projects} isAllProjects={isAllProjects} />

      <div className="card-footer">
        {isAllProjects ? (
          <Link to={ALL_INSTANCES_LIST_URL}>All instances list</Link>
        ) : (
          <Link to={getInstancesUrl(projectName)}>Project instances list</Link>
        )}
      </div>
    </>,
  );
};

export default ProjectsCard;
