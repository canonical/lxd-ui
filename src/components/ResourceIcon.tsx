import { Icon } from "@canonical/react-components";
import { FC } from "react";

export type InstanceIconType = "container" | "virtual-machine" | "instance";

export type ResourceIconType =
  | "container"
  | "virtual-machine"
  | "instance"
  | "snapshot"
  | "profile"
  | "project"
  | "cluster-group"
  | "cluster-member"
  | "network"
  | "pool"
  | "volume"
  | "iso-volume"
  | "image"
  | "oidc-identity"
  | "certificate"
  | "auth-group"
  | "idp-group"
  | "device";

const resourceIcons: Record<ResourceIconType, string> = {
  container: "pods",
  "virtual-machine": "pods",
  instance: "pods",
  snapshot: "snapshot",
  profile: "repository",
  project: "folder",
  "cluster-group": "cluster-host",
  "cluster-member": "single-host",
  network: "exposed",
  pool: "status-queued-small",
  volume: "status-queued-small",
  "iso-volume": "iso",
  image: "image",
  "oidc-identity": "user",
  certificate: "certificate",
  "auth-group": "user-group",
  "idp-group": "user-group",
  device: "units",
};

interface Props {
  type: ResourceIconType;
}

const ResourceIcon: FC<Props> = ({ type }) => {
  return <Icon name={resourceIcons[type]} />;
};

export default ResourceIcon;
