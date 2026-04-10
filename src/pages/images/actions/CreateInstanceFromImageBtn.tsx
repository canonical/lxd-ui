import type { FC } from "react";
import type { RemoteImage } from "types/image";
import { Button, Icon } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProject } from "context/useProjects";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  image: RemoteImage;
  projectName: string;
  disabledReason?: string;
}

const CreateInstanceFromImageBtn: FC<Props> = ({
  image,
  projectName,
  disabledReason,
}) => {
  const navigate = useNavigate();
  const { canCreateInstances } = useProjectEntitlements();
  const { data: project } = useProject(projectName);

  const openLaunchFlow = () => {
    navigate(
      `${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/instances/create`,
      {
        state: {
          selectedImage: image,
          cancelLocation: window.location.pathname,
        },
      },
    );
  };

  const getTitle = () => {
    if (!canCreateInstances(project)) {
      return "You do not have permission to create instances";
    }
    if (disabledReason) {
      return disabledReason;
    }
    return "Create instance";
  };

  return (
    <Button
      appearance="base"
      onClick={openLaunchFlow}
      type="button"
      title={getTitle()}
      hasIcon
      disabled={!!disabledReason || !canCreateInstances(project)}
    >
      <Icon name="play" />
    </Button>
  );
};

export default CreateInstanceFromImageBtn;
