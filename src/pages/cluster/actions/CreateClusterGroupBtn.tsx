import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams, { panels } from "util/usePanelParams";
import CreateClusterGroupPanel from "pages/cluster/panels/CreateClusterGroupPanel";

const CreateClusterGroupBtn: FC = () => {
  const panelParams = usePanelParams();

  return (
    <>
      <Button
        appearance="positive"
        className="u-no-margin--bottom"
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
