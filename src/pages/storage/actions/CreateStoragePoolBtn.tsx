import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import { useSmallScreen } from "context/useSmallScreen";
import { useServerEntitlements } from "util/entitlements/server";

interface Props {
  project: string;
  className?: string;
}

const CreateStoragePoolBtn: FC<Props> = ({ project, className }) => {
  const navigate = useNavigate();
  const isSmallScreen = useSmallScreen();
  const { canCreateStoragePools } = useServerEntitlements();

  return (
    <Button
      appearance="positive"
      className={className}
      hasIcon={!isSmallScreen}
      title={
        canCreateStoragePools()
          ? ""
          : "You do not have permission to create storage pools"
      }
      onClick={() => navigate(`/ui/project/${project}/storage/pools/create`)}
      disabled={!canCreateStoragePools()}
    >
      {!isSmallScreen && <Icon name="plus" light />}
      <span>Create pool</span>
    </Button>
  );
};

export default CreateStoragePoolBtn;
