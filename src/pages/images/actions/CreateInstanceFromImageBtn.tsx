import { FC } from "react";
import type { RemoteImage } from "types/image";
import { Button, Icon } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";

interface Props {
  image: RemoteImage;
  project: string;
}

const CreateInstanceFromImageBtn: FC<Props> = ({ image, project }) => {
  const navigate = useNavigate();

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
      title="Create instance"
      hasIcon
    >
      <Icon name="play" />
    </Button>
  );
};

export default CreateInstanceFromImageBtn;
