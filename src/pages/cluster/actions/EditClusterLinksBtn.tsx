import type { FC } from "react";
import { Button } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";
import type { LxdClusterLink } from "types/cluster";
import { useClusterLinkEntitlements } from "util/entitlements/cluster-links";
import DsIcon from "components/DsIcon";

interface Props {
  clusterLink: LxdClusterLink;
}

const EditClusterLinkBtn: FC<Props> = ({ clusterLink }) => {
  const { canEditClusterLink } = useClusterLinkEntitlements();
  const panelParams = usePanelParams();

  const canEdit = canEditClusterLink(clusterLink);

  return (
    <Button
      appearance="base"
      className="u-no-margin--bottom"
      onClick={() => {
        panelParams.openEditClusterLink(clusterLink.name);
      }}
      title={
        canEdit
          ? "Edit cluster link"
          : "You do not have permission to edit this cluster link"
      }
      hasIcon
      disabled={!canEdit}
    >
      <DsIcon icon="edit" />
    </Button>
  );
};

export default EditClusterLinkBtn;
