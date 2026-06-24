import {
  ConfirmationButton,
  useToastNotification,
} from "@canonical/react-components";
import { type FC, useState } from "react";
import ConfirmationCheckbox from "components/ConfirmationCheckbox";
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
  const toastNotify = useToastNotification();
  const { canEditProject } = useProjectEntitlements();
  const [isForce, setForce] = useState(false);

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
    toastNotify.failure("Could not promote project to leader.", e as Error);
  };

  const promoteToLeader = () => {
    setIsPromoting(true);
    updateReplicaMode(
      project,
      "leader",
      handleSuccess,
      handleFailure,
      isForce,
    ).finally(() => {
      setIsPromoting(false);
    });
  };

  return (
    <ConfirmationButton
      type="button"
      name="Promote to leader"
      hasIcon
      appearance="default"
      onClick={promoteToLeader}
      loading={isPromoting}
      onHoverText={
        disabledReason() ?? "Project will become the active replication source."
      }
      className="u-no-margin--bottom"
      disabled={Boolean(disabledReason())}
      confirmationModalProps={{
        title: "Confirm promote",
        children: (
          <p>
            This will promote project <ProjectRichChip projectName={project} />{" "}
            to leader.
          </p>
        ),
        confirmButtonLabel: "Promote",
        onConfirm: promoteToLeader,
        confirmExtra: (
          <ConfirmationCheckbox label="Force" confirmed={[isForce, setForce]} />
        ),
        confirmButtonAppearance: "positive",
      }}
    >
      <span>{isSmallScreen ? "Promote" : "Promote to leader"}</span>
    </ConfirmationButton>
  );
};

export default PromoteProjectBtn;
