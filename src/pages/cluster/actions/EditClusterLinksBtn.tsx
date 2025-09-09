import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";
import type { LxdClusterLink } from "types/cluster";

interface Props {
  clusterLink: LxdClusterLink;
}

const EditClusterLinkBtn: FC<Props> = ({ clusterLink }) => {
  const panel = usePanelParams();

  return (
    <Button
      appearance={"base"}
      className={"u-no-margin--bottom"}
      onClick={() => {
        panel.openEditClusterLink(clusterLink.name);
      }}
      title="Edit cluster link"
      hasIcon
    >
      <Icon name="edit" />
    </Button>
  );
};

export default EditClusterLinkBtn;
