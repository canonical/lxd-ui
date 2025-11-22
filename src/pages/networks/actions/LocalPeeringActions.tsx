import type { FC } from "react";
import { List } from "@canonical/react-components";
import DeleteLocalPeerBtn from "./DeleteLocalPeerBtn";
import type { LxdNetwork } from "types/network";
import EditLocalPeerBtn from "./EditLocalPeerBtn";

interface Props {
  network: LxdNetwork;
  localPeering: string;
}

const LocalPeeringActions: FC<Props> = ({ network, localPeering }) => {
  const menuElements = [
    <EditLocalPeerBtn
      key="edit"
      network={network}
      localPeering={localPeering}
    />,

    <DeleteLocalPeerBtn
      key="delete"
      network={network}
      localPeering={localPeering}
    />,
  ];
  return (
    <List
      inline
      className="u-no-margin--bottom actions-list"
      items={menuElements}
    />
  );
};

export default LocalPeeringActions;
