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

const DemoteProjectBtn: FC<Props> = ({ project, isEdit }: Props) => {
  const [isDemoting, setIsDemoting] = useState(false);
  const isSmallScreen = useIsScreenBelow();
  const toastNotify = useToastNotification();
  const { canEditProject } = useProjectEntitlements();
  const [isForce, setForce] = useState(false);

  const disabledReason = () => {
    if (!canEditProject) {
      return "You do not have permission to edit this project";
    }

    if (!isEdit) {
      return "Project must be created before it can be demoted to standby";
    }

    return undefined;
  };

  const handleSuccess = () => {
    toastNotify.success(
      <>
        Project <ProjectRichChip projectName={project} /> demoted to standby.
      </>,
    );
  };

  const handleFailure = (e: unknown) => {
    toastNotify.failure("Could not demote project to standby.", e as Error);
  };

  const demoteToStandby = () => {
    setIsDemoting(true);
    updateReplicaMode(
      project,
      "standby",
      handleSuccess,
      handleFailure,
      isForce,
    ).finally(() => {
      setIsDemoting(false);
    });
  };

  return (
    <ConfirmationButton
      type="button"
      name="Demote to standby"
      hasIcon
      appearance="default"
      onClick={demoteToStandby}
      loading={isDemoting}
      onHoverText={
        disabledReason() ??
        "Project will become the read-only replication target."
      }
      disabled={Boolean(disabledReason())}
      confirmationModalProps={{
        title: "Confirm demote",
        children: (
          <p>
            This will demote project <ProjectRichChip projectName={project} />{" "}
            to standby.
          </p>
        ),
        confirmButtonLabel: "Demote",
        onConfirm: demoteToStandby,
        confirmExtra: (
          <ConfirmationCheckbox label="Force" confirmed={[isForce, setForce]} />
        ),
        confirmButtonAppearance: "positive",
      }}
    >
      <span>{isSmallScreen ? "Demote" : "Demote to standby"}</span>
    </ConfirmationButton>
  );
};

export default DemoteProjectBtn;
