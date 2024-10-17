import { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import { useSmallScreen } from "context/useSmallScreen";

interface Props {
  project: string;
  className?: string;
}

const CreateStoragePoolBtn: FC<Props> = ({ project, className }) => {
  const navigate = useNavigate();
  const isSmallScreen = useSmallScreen();

  return (
    <Button
      appearance="positive"
      className={className}
      hasIcon={!isSmallScreen}
      onClick={() => navigate(`/ui/project/${project}/storage/pools/create`)}
    >
      {!isSmallScreen && <Icon name="plus" light />}
      <span>Create pool</span>
    </Button>
  );
};

export default CreateStoragePoolBtn;
