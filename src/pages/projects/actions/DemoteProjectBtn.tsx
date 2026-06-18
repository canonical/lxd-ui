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

const DemoteProjectBtn: FC<Props> = ({ project, isEdit }: Props) => {
  const [isDemoting, setIsDemoting] = useState(false);
  const isSmallScreen = useIsScreenBelow();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const { canEditProject } = useProjectEntitlements();

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
    notify.failure("Could not demote project to standby.", e as Error);
  };

  const demoteToStandby = () => {
    setIsDemoting(true);
    updateReplicaMode(project, "standby", handleSuccess, handleFailure).finally(
      () => {
        setIsDemoting(false);
      },
    );
  };

  return (
    <ActionButton
      type="button"
      name="Demote to standby"
      hasIcon
      appearance="default"
      onClick={demoteToStandby}
      loading={isDemoting}
      title={
        disabledReason() ??
        "Project will become the read-only replication target."
      }
      className="u-no-margin--bottom"
      disabled={Boolean(disabledReason())}
    >
      <span>{isSmallScreen ? "Demote" : "Demote to standby"}</span>
    </ActionButton>
  );
};

export default DemoteProjectBtn;
