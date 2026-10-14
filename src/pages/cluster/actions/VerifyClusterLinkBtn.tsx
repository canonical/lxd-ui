import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
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
          ? "Verify certificate"
          : "You do not have permission to create cluster links"
      }
      aria-label="Verify certificate"
      hasIcon
      disabled={!canVerify}
    >
      <Icon name="certificate" />
    </Button>
  );
};

export default VerifyClusterLinkBtn;
