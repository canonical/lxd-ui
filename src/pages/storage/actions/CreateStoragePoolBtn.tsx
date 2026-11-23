import type { FC } from "react";
import { Button } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import { useCurrentProject } from "context/useCurrentProject";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useServerEntitlements } from "util/entitlements/server";
import { ROOT_PATH } from "util/rootPath";
import DsIcon from "components/DsIcon";
import { getCreateRestriction } from "util/projects";

interface Props {
  project: string;
  className?: string;
}

const CreateStoragePoolBtn: FC<Props> = ({ project, className }) => {
  const navigate = useNavigate();
  const isSmallScreen = useIsScreenBelow();
  const { canCreateStoragePools } = useServerEntitlements();
  const { isAllProjects } = useCurrentProject();

  const createRestriction = getCreateRestriction({
    canCreate: canCreateStoragePools(),
    isAllProjects,
    noPermissionMessage: "You do not have permission to create storage pools",
    selectProjectMessage: "Select a project to create a pool",
  });

  return (
    <Button
      appearance="positive"
      className={className}
      hasIcon={!isSmallScreen}
      title={createRestriction}
      onClick={async () =>
        navigate(
          `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/storage/pools/create`,
        )
      }
      disabled={isAllProjects || !canCreateStoragePools()}
    >
      {!isSmallScreen && <DsIcon icon="plus" />}
      <span>Create pool</span>
    </Button>
  );
};

export default CreateStoragePoolBtn;
