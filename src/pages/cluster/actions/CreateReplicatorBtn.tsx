import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProject, useProjects } from "context/useProjects";

interface Props {
  appearance?: "positive" | "default";
  className?: string;
  project?: string;
  cluster?: string;
  hasClusterLinks?: boolean;
}

export const CreateReplicatorButton: FC<Props> = ({
  appearance = "positive",
  className,
  project,
  cluster,
  hasClusterLinks = true,
}) => {
  const { openCreateReplicator } = usePanelParams();
  const { data: allProjects = [] } = useProjects();
  const { data: projectObject } = useProject(project || "");
  const { canCreateReplicators } = useProjectEntitlements();
  const isDisabled =
    !hasClusterLinks ||
    !allProjects.some((project) => canCreateReplicators(project));

  const getTitle = () => {
    if (!hasClusterLinks) {
      return "You cannot create replicators because there are no cluster links.";
    }
    if (project && !canCreateReplicators(projectObject)) {
      return `You don't have permission to create replicators for project ${project}.`;
    }
    if (!allProjects.some((project) => canCreateReplicators(project))) {
      return "You don't have permission to create replicators in any project.";
    }
    return undefined;
  };

  return (
    <Button
      type="button"
      name="Create replicator"
      hasIcon
      appearance={appearance}
      className={className}
      onClick={() => {
        openCreateReplicator(project, cluster);
      }}
      disabled={isDisabled}
      title={getTitle()}
    >
      <Icon
        name="plus"
        light={appearance === "positive"}
        className="u-margin--right"
      />
      <span>Create replicator</span>
    </Button>
  );
};
