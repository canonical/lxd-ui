import React, { FC } from "react";
import { LxdImageType, RemoteImage } from "types/image";
import { Button, Icon } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";

interface Props {
  image: RemoteImage;
  project: string;
  type: LxdImageType;
}

const CreateInstanceFromImageBtn: FC<Props> = ({ image, project, type }) => {
  const navigate = useNavigate();

  const openLaunchFlow = () => {
    navigate(`/ui/project/${project}/instances/create`, {
      state: {
        selectedImage: image,
        cancelLocation: window.location.pathname,
        type,
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
