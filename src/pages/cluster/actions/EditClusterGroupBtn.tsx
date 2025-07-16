import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams, { panels } from "util/usePanelParams";
import EditClusterGroupPanel from "pages/cluster/panels/EditClusterGroupPanel";

interface Props {
  group: string;
}

const EditClusterGroupBtn: FC<Props> = ({ group }) => {
  const panelParams = usePanelParams();

  return (
    <>
      <Button
        appearance="base"
        className="u-no-margin--bottom"
        onClick={() => {
          panelParams.openEditClusterGroup(group);
        }}
        title="Edit group"
        hasIcon
      >
        <Icon name="edit" />
      </Button>
      {panelParams.panel === panels.editClusterGroups &&
        panelParams.group === group && <EditClusterGroupPanel />}
    </>
  );
};

export default EditClusterGroupBtn;
