import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useCurrentProject } from "context/useCurrentProject";
import usePanelParams from "util/usePanelParams";

interface Props {
  className?: string;
}

const CreateStorageBucketBtn: FC<Props> = ({ className }) => {
  const isSmallScreen = useIsScreenBelow();
  const { canCreateStorageBuckets } = useProjectEntitlements();
  const { project } = useCurrentProject();
  const panelParams = usePanelParams();

  return (
    <Button
      appearance="positive"
      hasIcon={!isSmallScreen}
      onClick={() => {
        panelParams.openCreateStorageBucket(project?.name || "");
      }}
      className={className}
      disabled={!canCreateStorageBuckets(project)}
      title={
        canCreateStorageBuckets(project)
          ? "Create bucket"
          : "You do not have permission to create buckets in this project"
      }
    >
      {!isSmallScreen && <Icon name="plus" light />}
      <span>Create bucket</span>
    </Button>
  );
};

export default CreateStorageBucketBtn;
