import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";
import type { LxdClusterLink } from "types/cluster";
import { useClusterLinkEntitlements } from "util/entitlements/cluster-links";

interface Props {
  clusterLink: LxdClusterLink;
}

const EditClusterLinkBtn: FC<Props> = ({ clusterLink }) => {
  const { canEditClusterLink } = useClusterLinkEntitlements();
  const panel = usePanelParams();

  const canEdit = canEditClusterLink(clusterLink);

  return (
    <Button
      appearance={"base"}
      className={"u-no-margin--bottom"}
      onClick={() => {
        panel.openEditClusterLink(clusterLink.name);
      }}
      title={
        canEdit
          ? "Edit cluster link"
          : "You do not have permission to edit this cluster link"
      }
      hasIcon
      disabled={!canEdit}
    >
      <Icon name="edit" />
    </Button>
  );
};

export default EditClusterLinkBtn;
