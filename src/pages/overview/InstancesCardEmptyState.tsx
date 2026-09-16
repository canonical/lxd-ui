import { useCurrentProject } from "context/useCurrentProject";
import { useProjects } from "context/useProjects";
import { Link } from "react-router-dom";
import { useProjectEntitlements } from "util/entitlements/projects";
import { getDefaultProject } from "util/loginProject";
import { getInstancesUrl } from "util/projects";
import CardEmptyState from "./CardEmptyState";

const InstancesCardEmptyState = () => {
  const { canCreateInstances } = useProjectEntitlements();
  const { project, isAllProjects } = useCurrentProject();
  const { data: projects = [] } = useProjects();
  const defaultProjectName = getDefaultProject(projects);
  const defaultProject = projects.find(
    (project) => project.name === defaultProjectName,
  );
  const projectForCreation = isAllProjects ? defaultProject : project;
  const instancesUrl = getInstancesUrl(projectForCreation?.name ?? "default");
  const canCreate = canCreateInstances(projectForCreation);

  return (
    <CardEmptyState
      title="No instances found"
      subtitle={
        canCreate && (
          <>
            Create an instance on the{" "}
            <Link to={instancesUrl}>instances list</Link> page
          </>
        )
      }
      footerLink={<Link to={instancesUrl}>Instances list</Link>}
    />
  );
};

export default InstancesCardEmptyState;
