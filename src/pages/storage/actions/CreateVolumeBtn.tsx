import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import { useSmallScreen } from "context/useSmallScreen";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProject } from "context/useProjects";

interface Props {
  projectName: string;
  defaultPool?: string;
  className?: string;
}

const CreateVolumeBtn: FC<Props> = ({
  projectName,
  className,
  defaultPool,
}) => {
  const navigate = useNavigate();
  const isSmallScreen = useSmallScreen();
  const { canCreateStorageVolumes } = useProjectEntitlements();
  const { data: project } = useProject(projectName);

  const handleAdd = () => {
    navigate(
      `/ui/project/${projectName}/storage/volumes/create${
        defaultPool ? `?pool=${defaultPool}` : ""
      }`,
    );
  };

  return (
    <Button
      appearance="positive"
      hasIcon={!isSmallScreen}
      onClick={handleAdd}
      className={className}
      disabled={!canCreateStorageVolumes(project)}
    >
      {!isSmallScreen && <Icon name="plus" light />}
      <span>Create volume</span>
    </Button>
  );
};

export default CreateVolumeBtn;
