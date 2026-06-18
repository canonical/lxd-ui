import {
  ActionButton,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { type FC, useState } from "react";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import ProjectRichChip from "pages/projects/ProjectRichChip";
import { useProjectEntitlements } from "util/entitlements/projects";
import { updateReplicaMode } from "util/projects";

interface Props {
  project: string;
  isEdit: boolean;
}

const PromoteProjectBtn: FC<Props> = ({ project, isEdit }: Props) => {
  const [isPromoting, setIsPromoting] = useState(false);
  const isSmallScreen = useIsScreenBelow();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const { canEditProject } = useProjectEntitlements();

  const disabledReason = () => {
    if (!canEditProject) {
      return "You do not have permission to edit this project";
    }

    if (!isEdit) {
      return "Project must be created before it can be promoted to leader";
    }

    return undefined;
  };

  const handleSuccess = () => {
    toastNotify.success(
      <>
        Project <ProjectRichChip projectName={project} /> promoted to leader.
      </>,
    );
  };

  const handleFailure = (e: unknown) => {
    notify.failure("Could not promote project to leader.", e as Error);
  };

  const promoteToLeader = () => {
    setIsPromoting(true);
    updateReplicaMode(project, "leader", handleSuccess, handleFailure).finally(
      () => {
        setIsPromoting(false);
      },
    );
  };

  return (
    <ActionButton
      type="button"
      name="Promote to leader"
      hasIcon
      appearance="default"
      onClick={promoteToLeader}
      loading={isPromoting}
      title={
        disabledReason() ?? "Project will become the active replication source."
      }
      className="u-no-margin--bottom"
      disabled={Boolean(disabledReason())}
    >
      <span>{isSmallScreen ? "Promote" : "Promote to leader"}</span>
    </ActionButton>
  );
};

export default PromoteProjectBtn;
