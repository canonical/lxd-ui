import type { FC } from "react";
import { Button } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useServerEntitlements } from "util/entitlements/server";
import { ROOT_PATH } from "util/rootPath";
import DsIcon from "components/DsIcon";

interface Props {
  project: string;
  className?: string;
}

const CreateStoragePoolBtn: FC<Props> = ({ project, className }) => {
  const navigate = useNavigate();
  const isSmallScreen = useIsScreenBelow();
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
      onClick={async () =>
        navigate(
          `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/storage/pools/create`,
        )
      }
      disabled={!canCreateStoragePools()}
    >
      {!isSmallScreen && <DsIcon icon="plus" />}
      <span>Create pool</span>
    </Button>
  );
};

export default CreateStoragePoolBtn;
