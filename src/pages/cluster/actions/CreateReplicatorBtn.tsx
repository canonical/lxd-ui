import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProjects } from "context/useProjects";

export const CreateReplicatorButton: FC = () => {
  const { openCreateReplicator } = usePanelParams();
  const { data: allProjects = [] } = useProjects();
  const { canCreateReplicators } = useProjectEntitlements();
  const isDisabled = !allProjects.some((project) =>
    canCreateReplicators(project),
  );
  return (
    <Button
      name="Create replicator"
      hasIcon
      appearance="positive"
      className="u-no-margin--bottom"
      onClick={openCreateReplicator}
      disabled={isDisabled}
      title={
        isDisabled
          ? "You don't have permission to create replicators in any project."
          : undefined
      }
    >
      <Icon name="plus" light className="u-margin--right" />
      <span>Create replicator</span>
    </Button>
  );
};
