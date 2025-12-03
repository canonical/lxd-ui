import { Icon } from "@canonical/react-components";
import type { FC } from "react";

export type InstanceIconType = "container" | "virtual-machine" | "instance";

export type ResourceIconType =
  | "bucket"
  | "bucket-key"
  | "container"
  | "virtual-machine"
  | "instance"
  | "snapshot"
  | "profile"
  | "project"
  | "cluster-group"
  | "cluster-member"
  | "network"
  | "network-acl"
  | "network-forward"
  | "pool"
  | "volume"
  | "iso-volume"
  | "image"
  | "metric"
  | "oidc-identity"
  | "placement-group"
  | "certificate"
  | "auth-group"
  | "idp-group"
  | "device"
  | "setting"
  | "peering";

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
  peering: "exposed",
  "network-acl": "security-tick",
  "network-forward": "exposed",
  pool: "status-queued-small",
  volume: "status-queued-small",
  "iso-volume": "iso",
  image: "image",
  "oidc-identity": "user",
  certificate: "certificate",
  "auth-group": "user-group",
  "idp-group": "user-group",
  device: "units",
  setting: "settings",
  bucket: "status-queued-small",
  "bucket-key": "private-key",
  metric: "statistics",
  "placement-group": "repository",
};

interface Props {
  type: ResourceIconType;
  className?: string;
}

const ResourceIcon: FC<Props> = ({ type, className }) => {
  return <Icon name={resourceIcons[type]} className={className} />;
};

export default ResourceIcon;
