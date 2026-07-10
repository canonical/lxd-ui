import type { FC } from "react";
import { Link } from "react-router-dom";
import { Card, Icon, Spinner } from "@canonical/react-components";
import { useProjects } from "context/useProjects";
import ProjectRichChip from "pages/projects/ProjectRichChip";
import type { LxdProject } from "types/project";
import { pluralize } from "util/helpers";
import { getInstancesUsedByProject } from "util/projects";
import { ROOT_PATH } from "util/rootPath";

const ProjectsCard: FC = () => {
  const { data: projects = [], error, isLoading } = useProjects();
  const PROJECTS_LIMIT = 5;

  const projectsWithCounts = projects.map((project: LxdProject) => {
    return {
      name: project.name,
      instanceCount: getInstancesUsedByProject(project).length,
    };
  });

  const topProjects = projectsWithCounts
    .sort((a, b) => b.instanceCount - a.instanceCount)
    .slice(0, PROJECTS_LIMIT);

  const cardClassName = "overview-card projects";
  const cardTitle = (
    <>
      <Icon name="folder" /> Projects
      {!isLoading && !error && projects.length > 0 && ` (${projects.length})`}
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
    <Card className="overview-card projects" title={cardTitle}>
      {!isLoading && !error && (
        <>
          <table className="projects-instances-ranking-table u-no-margin">
            <tbody>
              {topProjects.map((project) => {
                return (
                  <tr key={project.name}>
                    <td>
                      <ProjectRichChip projectName={project.name} />
                    </td>
                    <td className="u-align--right u-text--muted">
                      {project.instanceCount}{" "}
                      {pluralize("instance", project.instanceCount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="card-footer">
            <Link to={`${ROOT_PATH}/ui/projects`}>See more</Link>
          </div>
        </>
      )}
    </Card>
  );
};

export default ProjectsCard;
