import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Button, EmptyState, Icon } from "@canonical/react-components";
import classnames from "classnames";
import DocLink from "components/DocLink";
import { useCurrentProject } from "context/useCurrentProject";
import { useProject } from "context/useProjects";
import { useProjectEntitlements } from "util/entitlements/projects";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  className?: string;
}

const InstanceEmptyState: FC<Props> = ({ className }) => {
  const navigate = useNavigate();
  const { canCreateInstances } = useProjectEntitlements();
  const { project, isAllProjects } = useCurrentProject();
  const { data: defaultProject } = useProject("default", isAllProjects);

  const projectForCreation = isAllProjects ? defaultProject : project;
  const projectForCreationName = projectForCreation?.name ?? "default";
  const createInstanceRestriction = canCreateInstances(projectForCreation)
    ? ""
    : `You do not have permission to create instances in project ${projectForCreationName}`;

  return (
    <EmptyState
      className={classnames("empty-state", className)}
      image={<Icon name="pods" className="empty-state-icon" />}
      title="No instances found"
    >
      <p>
        There are no instances in {isAllProjects ? "any" : "this"} project.
        {canCreateInstances(projectForCreation)
          ? " Spin up your first instance!"
          : ""}
      </p>
      <p>
        <DocLink docPath="/howto/instances_create/" hasExternalIcon>
          How to create instances
        </DocLink>
      </p>
      <Button
        className="empty-state-button"
        appearance="positive"
        onClick={async () =>
          navigate(
            `${ROOT_PATH}/ui/project/${encodeURIComponent(projectForCreationName)}/instances/create`,
          )
        }
        disabled={!!createInstanceRestriction}
        title={createInstanceRestriction}
      >
        Create instance
      </Button>
    </EmptyState>
  );
};

export default InstanceEmptyState;
