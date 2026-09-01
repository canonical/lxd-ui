import type { FC } from "react";
import { Button } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";
import { useServerEntitlements } from "util/entitlements/server";
import DsIcon from "components/DsIcon";

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
      <DsIcon icon="plus" />
      <span>Create cluster link</span>
    </Button>
  );
};

export default CreateClusterLinkBtn;
