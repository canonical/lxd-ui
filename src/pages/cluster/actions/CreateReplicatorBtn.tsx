import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProjects } from "context/useProjects";

interface Props {
  isPositive?: boolean;
  className?: string;
  project?: string;
  cluster?: string;
}

export const CreateReplicatorButton: FC<Props> = ({
  isPositive = true,
  className,
  project,
  cluster,
}) => {
  const { openCreateReplicator } = usePanelParams();
  const { data: allProjects = [] } = useProjects();
  const { canCreateReplicators } = useProjectEntitlements();
  const isDisabled = !allProjects.some((project) =>
    canCreateReplicators(project),
  );
  return (
    <Button
      type="button"
      name="Create replicator"
      hasIcon
      appearance={isPositive ? "positive" : "default"}
      className={className}
      onClick={() => {
        openCreateReplicator(project, cluster);
      }}
      disabled={isDisabled}
      title={
        isDisabled
          ? "You don't have permission to create replicators in any project."
          : undefined
      }
    >
      <Icon name="plus" light={isPositive} className="u-margin--right" />
      <span>Create replicator</span>
    </Button>
  );
};
