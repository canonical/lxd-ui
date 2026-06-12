import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";
import { useServerEntitlements } from "util/entitlements/server";

interface Props {
  appearance?: "positive" | "base" | "default";
}

const CreateClusterLinkBtn: FC<Props> = ({ appearance = "positive" }) => {
  const panelParams = usePanelParams();
  const { canCreateClusterLinks } = useServerEntitlements();
  const disableReason = canCreateClusterLinks()
    ? undefined
    : "You do not have permission to create cluster links";

  return (
    <Button
      type="button"
      appearance={appearance}
      className="u-no-margin--bottom"
      hasIcon
      onClick={panelParams.openCreateClusterLink}
      title={disableReason}
      disabled={disableReason !== undefined}
    >
      <Icon name="plus" light={appearance === "positive"} />
      <span>Create cluster link</span>
    </Button>
  );
};

export default CreateClusterLinkBtn;
