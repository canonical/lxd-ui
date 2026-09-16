import type { FC, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icon, Spinner } from "@canonical/react-components";
import Breadcrumb from "components/Breadcrumb";
import ProjectTable from "pages/overview/ProjectTable";
import { useCurrentProject } from "context/useCurrentProject";
import { useProjects } from "context/useProjects";
import ProjectExplanationTooltip from "pages/projects/ProjectExplanationTooltip";
import { useServerEntitlements } from "util/entitlements/server";
import { ALL_INSTANCES_LIST_URL } from "util/instances";
import {
  ALL_PROJECTS,
  ALL_PROJECTS_OVERVIEW_PATH,
  getInstancesUrl,
} from "util/projects";
import CardEmptyState from "./CardEmptyState";
import { renderOverviewCard } from "util/overview";

const ProjectsCard: FC = () => {
  const { project: currentProject, projectName } = useCurrentProject();
  const isAllProjects = projectName === ALL_PROJECTS;
  const { canCreateProjects } = useServerEntitlements();
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
      </span>
      <ProjectExplanationTooltip />
    </>
  );

  const footerLink = isAllProjects ? (
    <Link to={ALL_INSTANCES_LIST_URL}>All instances list</Link>
  ) : (
    <Link to={getInstancesUrl(projectName)}>Project instances list</Link>
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
      {renderOverviewCard(cardClassName, cardTitle, content, footerLink)}
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

  if (projects.length === 0) {
    return renderCard(
      <CardEmptyState
        title="No projects found"
        subtitle={
          canCreateProjects() && (
            <>Create a project in the navigation menu project dropdown</>
          )
        }
      />,
    );
  }

  return renderCard(
    <ProjectTable projects={projects} isAllProjects={isAllProjects} />,
  );
};

export default ProjectsCard;
