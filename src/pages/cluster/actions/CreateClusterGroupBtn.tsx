import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";

const CreateClusterGroupBtn: FC = () => {
  const panelParams = usePanelParams();

  return (
    <Button
      appearance="positive"
      className="u-no-margin--bottom"
      hasIcon
      onClick={panelParams.openCreateClusterGroup}
    >
      <Icon name="plus" light />
      <span>Create group</span>
    </Button>
  );
};

export default CreateClusterGroupBtn;
