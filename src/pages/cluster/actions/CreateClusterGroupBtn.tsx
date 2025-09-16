import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams, { panels } from "util/usePanelParams";
import CreateClusterGroupPanel from "pages/cluster/panels/CreateClusterGroupPanel";
import { useServerEntitlements } from "util/entitlements/server";

const CreateClusterGroupBtn: FC = () => {
  const panelParams = usePanelParams();
  const { canEditServerConfiguration } = useServerEntitlements();

  const hasPermission = canEditServerConfiguration();

  return (
    <>
      <Button
        appearance="positive"
        className="u-no-margin--bottom"
        disabled={!hasPermission}
        title={
          hasPermission
            ? undefined
            : "You do not have permission to create cluster groups"
        }
        hasIcon
        onClick={panelParams.openCreateClusterGroup}
      >
        <Icon name="plus" light />
        <span>Create group</span>
      </Button>
      {panelParams.panel === panels.createClusterGroup && (
        <CreateClusterGroupPanel />
      )}
    </>
  );
};

export default CreateClusterGroupBtn;
