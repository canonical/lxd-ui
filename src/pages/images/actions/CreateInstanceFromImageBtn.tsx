import { FC } from "react";
import type { RemoteImage } from "types/image";
import { Button, Icon } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import { useProjectEntitlements } from "util/entitlements/projects";

interface Props {
  image: RemoteImage;
  project: string;
}

const CreateInstanceFromImageBtn: FC<Props> = ({ image, project }) => {
  const navigate = useNavigate();
  const { canCreateInstances } = useProjectEntitlements();

  const openLaunchFlow = () => {
    void navigate(`/ui/project/${project}/instances/create`, {
      state: {
        selectedImage: image,
        cancelLocation: window.location.pathname,
      },
    });
  };

  return (
    <Button
      appearance="base"
      onClick={openLaunchFlow}
      type="button"
      title={
        canCreateInstances()
          ? "Create instance"
          : "You do not have permission to create instances"
      }
      hasIcon
      disabled={!canCreateInstances()}
    >
      <Icon name="play" />
    </Button>
  );
};

export default CreateInstanceFromImageBtn;
