import type { FC } from "react";
import { Button } from "@canonical/react-components";
import usePanelParams, { panels } from "util/usePanelParams";
import EditClusterGroupPanel from "pages/cluster/panels/EditClusterGroupPanel";
import { useServerEntitlements } from "util/entitlements/server";
import DsIcon from "components/DsIcon";

interface Props {
  group: string;
}

const EditClusterGroupBtn: FC<Props> = ({ group }) => {
  const panelParams = usePanelParams();
  const { canEditServerConfiguration } = useServerEntitlements();
  const hasPermission = canEditServerConfiguration();

  return (
    <>
      <Button
        appearance="base"
        className="u-no-margin--bottom"
        disabled={!hasPermission}
        onClick={() => {
          panelParams.openEditClusterGroup(group);
        }}
        title={
          hasPermission
            ? "Edit group"
            : "You do not have permission to edit cluster groups"
        }
        hasIcon
      >
        <DsIcon icon="edit" />
      </Button>
      {panelParams.panel === panels.editClusterGroups &&
        panelParams.group === group && <EditClusterGroupPanel />}
    </>
  );
};

export default EditClusterGroupBtn;
