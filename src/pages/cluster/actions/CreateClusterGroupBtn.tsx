import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import CreateClusterGroupPanel from "pages/cluster/panels/CreateClusterGroupPanel";
import { useServerEntitlements } from "util/entitlements/server";
import usePanelParams, { panels } from "util/usePanelParams";

interface Props {
  disabled?: boolean;
}

const CreateClusterGroupBtn: FC<Props> = ({ disabled }) => {
  const panelParams = usePanelParams();
  const { canEditServerConfiguration } = useServerEntitlements();
  const isSmallScreen = useIsScreenBelow();

  const hasPermission = canEditServerConfiguration();

  return (
    <>
      <Button
        appearance="positive"
        className={isSmallScreen ? undefined : "u-no-margin--bottom"}
        disabled={disabled || !hasPermission}
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
