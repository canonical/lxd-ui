import type { FC } from "react";
import { Card, Icon, Spinner } from "@canonical/react-components";
import { useProjects } from "context/useProjects";
import { useInstances } from "context/useInstances";
import ProjectRichChip from "pages/projects/ProjectRichChip";
import { pluralize } from "util/helpers";

const ProjectsCard: FC = () => {
  const {
    data: projects = [],
    error: projectsError,
    isLoading: projectsLoading,
  } = useProjects();
  const {
    data: instances = [],
    error: instancesError,
    isLoading: instancesLoading,
  } = useInstances(null);

  const isLoading = projectsLoading || instancesLoading;
  const error = projectsError || instancesError;

  const projectsWithCounts = projects.map((project) => {
    const projectInstances = instances.filter(
      (instance) => instance.project === project.name,
    );
    return {
      name: project.name,
      instanceCount: projectInstances.length,
    };
  });

  const topProjects = projectsWithCounts
    .sort((a, b) => b.instanceCount - a.instanceCount)
    .slice(0, 3);

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
          {projects.length > 3 && (
            <div className="plus-n-more u-text--muted">
              + {projects.length - 3} more
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default ProjectsCard;
