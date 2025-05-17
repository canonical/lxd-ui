import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import { useSmallScreen } from "context/useSmallScreen";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useCurrentProject } from "context/useCurrentProject";

interface Props {
  className?: string;
}

const CreateBucketBtn: FC<Props> = ({ className }) => {
  const navigate = useNavigate();
  const isSmallScreen = useSmallScreen();
  const { canCreateStorageBuckets } = useProjectEntitlements();
  const { project } = useCurrentProject();

  const handleAdd = () => {
    navigate(`/ui/project/${project?.name}/storage/buckets/create`);
  };

  return (
    <Button
      appearance="positive"
      hasIcon={!isSmallScreen}
      onClick={handleAdd}
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

export default CreateBucketBtn;
