import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useSmallScreen } from "context/useSmallScreen";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useCurrentProject } from "context/useCurrentProject";
import usePanelParams from "util/usePanelParams";

interface Props {
  className?: string;
}

const CreateStorageBucketKeyBtn: FC<Props> = ({ className }) => {
  const isSmallScreen = useSmallScreen();
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
      {!isSmallScreen && <Icon name="plus" light />}
      <span>Create key</span>
    </Button>
  );
};

export default CreateStorageBucketKeyBtn;
