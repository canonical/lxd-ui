import { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import { useSmallScreen } from "context/useSmallScreen";

interface Props {
  project: string;
  defaultPool?: string;
  className?: string;
}

const CreateVolumeBtn: FC<Props> = ({ project, className, defaultPool }) => {
  const navigate = useNavigate();
  const isSmallScreen = useSmallScreen();

  const handleAdd = () => {
    navigate(
      `/ui/project/${project}/storage/volumes/create${
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
    >
      {!isSmallScreen && <Icon name="plus" light />}
      <span>Create volume</span>
    </Button>
  );
};

export default CreateVolumeBtn;
