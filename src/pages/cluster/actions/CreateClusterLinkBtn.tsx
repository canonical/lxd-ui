import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";

const CreateClusterLinkBtn: FC = () => {
  const panelParams = usePanelParams();

  return (
    <Button
      appearance="positive"
      className="u-no-margin--bottom"
      hasIcon
      onClick={panelParams.openCreateClusterLink}
    >
      <Icon name="plus" light />
      <span>Create link</span>
    </Button>
  );
};

export default CreateClusterLinkBtn;
