import { useCurrentProject } from "context/useCurrentProject";
import { useProject } from "context/useProjects";
import { Link } from "react-router-dom";
import { useProjectEntitlements } from "util/entitlements/projects";
import { getInstancesUrl } from "util/projects";

const InstancesCardEmptyState = () => {
  const { canCreateInstances } = useProjectEntitlements();
  const { project, isAllProjects } = useCurrentProject();
  const { data: defaultProject } = useProject("default", isAllProjects);
  const projectForCreation = isAllProjects ? defaultProject : project;
  const projectForCreationName = projectForCreation?.name ?? "default";
  const instancesUrl = getInstancesUrl(projectForCreationName);

  const instanceListLink = (label: string) => {
    return <Link to={instancesUrl}>{label}</Link>;
  };

  return (
    <>
      <div className="overview-empty-state u-no-margin--bottom">
        <div className="overview-card-subtitle">No instances found</div>
        {canCreateInstances(projectForCreation) && (
          <p>
            Create an instance on the {instanceListLink("instances list")} page
          </p>
        )}
      </div>
      <div className="card-footer">{instanceListLink("Instances list")}</div>
    </>
  );
};

export default InstancesCardEmptyState;
