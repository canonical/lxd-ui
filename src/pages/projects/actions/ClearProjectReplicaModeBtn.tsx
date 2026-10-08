import {
  ConfirmationButton,
  useToastNotification,
} from "@canonical/react-components";
import { type FC, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmationCheckbox from "components/ConfirmationCheckbox";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import ProjectRichChip from "pages/projects/ProjectRichChip";
import { useProjectEntitlements } from "util/entitlements/projects";
import { updateReplicaMode } from "util/projects";
import { queryKeys } from "util/queryKeys";
import type { LxdProject } from "types/project";

interface Props {
  project: LxdProject;
  isEdit: boolean;
}

const ClearProjectReplicaModeBtn: FC<Props> = ({ project, isEdit }: Props) => {
  const [isClearing, setIsClearing] = useState(false);
  const isSmallScreen = useIsScreenBelow();
  const toastNotify = useToastNotification();
  const { canEditProject } = useProjectEntitlements();
  const queryClient = useQueryClient();
  const [isForce, setForce] = useState(false);

  const disabledReason = () => {
    if (!canEditProject(project)) {
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
        <ProjectRichChip projectName={project.name} />.
      </>,
    );
  };

  const handleFailure = (e: unknown) => {
    toastNotify.failure(
      "Could not clear replica mode for project.",
      e as Error,
    );
  };

  const clearReplicaMode = () => {
    setIsClearing(true);
    updateReplicaMode(
      project.name,
      "",
      handleSuccess,
      handleFailure,
      isForce,
    ).finally(() => {
      setIsClearing(false);
      void queryClient.invalidateQueries({
        queryKey: [queryKeys.projects, project.name],
      });
    });
  };

  return (
    <ConfirmationButton
      type="button"
      name="Clear replica mode"
      hasIcon
      appearance="base"
      onClick={clearReplicaMode}
      loading={isClearing}
      onHoverText={disabledReason() ?? "Clear replica mode for project."}
      disabled={Boolean(disabledReason())}
      confirmationModalProps={{
        title: "Confirm clear replica mode",
        children: (
          <p>
            This will clear the replica mode for project{" "}
            <ProjectRichChip projectName={project.name} />.
          </p>
        ),
        confirmButtonLabel: "Clear",
        onConfirm: clearReplicaMode,
        confirmExtra: (
          <ConfirmationCheckbox label="Force" confirmed={[isForce, setForce]} />
        ),
        confirmButtonAppearance: "positive",
      }}
    >
      <span>{isSmallScreen ? "Clear" : "Clear replica mode"}</span>
    </ConfirmationButton>
  );
};

export default ClearProjectReplicaModeBtn;
