import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";
import { useServerEntitlements } from "util/entitlements/server";

const CreateClusterLinkBtn: FC = () => {
  const panelParams = usePanelParams();
  const { canCreateClusterLinks } = useServerEntitlements();
  const disableReason = canCreateClusterLinks()
    ? undefined
    : "You do not have permission to create cluster links";

  return (
    <Button
      appearance="positive"
      className="u-no-margin--bottom"
      hasIcon
      onClick={panelParams.openCreateClusterLink}
      title={disableReason}
      disabled={disableReason !== undefined}
    >
      <Icon name="plus" light />
      <span>Create link</span>
    </Button>
  );
};

export default CreateClusterLinkBtn;
