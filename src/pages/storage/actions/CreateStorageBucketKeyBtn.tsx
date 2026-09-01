import type { FC } from "react";
import { Button } from "@canonical/react-components";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useCurrentProject } from "context/useCurrentProject";
import usePanelParams from "util/usePanelParams";
import DsIcon from "components/DsIcon";

interface Props {
  className?: string;
}

const CreateStorageBucketKeyBtn: FC<Props> = ({ className }) => {
  const isSmallScreen = useIsScreenBelow();
  const { canCreateStorageBuckets } = useProjectEntitlements();
  const { project } = useCurrentProject();
  const panelParams = usePanelParams();

  return (
    <Button
      appearance="positive"
      hasIcon={!isSmallScreen}
      onClick={() => {
        panelParams.openCreateStorageBucketKey(project?.name || "");
      }}
      className={className}
      disabled={!canCreateStorageBuckets(project)}
      title={
        canCreateStorageBuckets(project)
          ? "Create bucket key"
          : "You do not have permission to create keys for this bucket"
      }
    >
      {!isSmallScreen && <DsIcon icon="plus" />}
      <span>Create key</span>
    </Button>
  );
};

export default CreateStorageBucketKeyBtn;
