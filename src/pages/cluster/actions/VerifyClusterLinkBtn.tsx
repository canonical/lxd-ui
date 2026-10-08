import type { FC } from "react";
import { Button } from "@canonical/react-components";
import DsIcon from "components/DsIcon";
import usePanelParams from "util/usePanelParams";
import type { LxdClusterLink } from "types/cluster";
import { useServerEntitlements } from "util/entitlements/server";

interface Props {
  clusterLink: LxdClusterLink;
}

const VerifyClusterLinkBtn: FC<Props> = ({ clusterLink }) => {
  const { canCreateClusterLinks } = useServerEntitlements();
  const panelParams = usePanelParams();

  const canVerify = canCreateClusterLinks();

  return (
    <Button
      appearance="base"
      className="u-no-margin--bottom"
      onClick={() => {
        panelParams.openVerifyClusterLink(clusterLink.name);
      }}
      title={
        canVerify
          ? "Verify cluster link certificate"
          : "You do not have permission to create cluster links"
      }
      hasIcon
      disabled={!canVerify}
    >
      <DsIcon icon="certificate" />
    </Button>
  );
};

export default VerifyClusterLinkBtn;
