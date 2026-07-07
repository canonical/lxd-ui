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

const ClearProjectReplicaModeBtn: FC<Props> = ({ project, isEdit }: Props) => {
  const [isClearing, setIsClearing] = useState(false);
  const isSmallScreen = useIsScreenBelow();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const { canEditProject } = useProjectEntitlements();

  const disabledReason = () => {
    if (!canEditProject) {
      return "You do not have permission to edit this project";
    }

    if (!isEdit) {
      return "Project must be created before it can have its replica mode cleared";
    }

    return undefined;
  };

  const handleSuccess = () => {
    toastNotify.success(
      <>
        Replica mode cleared for project{" "}
        <ProjectRichChip projectName={project} />.
      </>,
    );
  };

  const handleFailure = (e: unknown) => {
    notify.failure("Could not clear replica mode for project.", e as Error);
  };

  const clearReplicaMode = () => {
    setIsClearing(true);
    updateReplicaMode(project, "", handleSuccess, handleFailure).finally(() => {
      setIsClearing(false);
    });
  };

  return (
    <ActionButton
      type="button"
      name="Clear replica mode"
      hasIcon
      appearance="base"
      onClick={clearReplicaMode}
      loading={isClearing}
      title={disabledReason() ?? "Clear replica mode for project."}
      disabled={Boolean(disabledReason())}
    >
      <span>{isSmallScreen ? "Clear" : "Clear replica mode"}</span>
    </ActionButton>
  );
};

export default ClearProjectReplicaModeBtn;
