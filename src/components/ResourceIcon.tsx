import { Icon } from "@canonical/react-components";
import { Icon as DsIcon } from "@canonical/react-ds-global";
import type { IconName } from "@canonical/ds-assets";
import type { FC } from "react";

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
  | "cluster-link"
  | "cluster-member"
  | "load-balancer"
  | "load-balancer-pool"
  | "network"
  | "network-acl"
  | "network-forward"
  | "pool"
  | "volume"
  | "iso-volume"
  | "image"
  | "image-registry"
  | "metric"
  | "oidc-identity"
  | "placement-group"
  | "certificate"
  | "auth-group"
  | "idp-group"
  | "device"
  | "setting"
  | "peering"
  | "replicator"
  | "token-bearer";

// Icons available in @canonical/ds-assets — rendered via DsIcon (<svg><use>).
// Move entries here from legacyResourceIcons as ds-assets gains coverage.
const dsResourceIcons: Partial<Record<ResourceIconType, IconName>> = {
  "image-registry": "image-registries",
  network: "exposed",
  project: "folder",
};

// Icons not yet in @canonical/ds-assets — rendered via vanilla-framework CSS.
const legacyResourceIcons: Record<string, string> = {
  container: "pods",
  "virtual-machine": "pods",
  instance: "pods",
  snapshot: "snapshot",
  profile: "repository",
  "cluster-group": "cluster-host",
  "cluster-member": "single-host",
  "cluster-link": "applications",
  "load-balancer": "exposed",
  "load-balancer-pool": "exposed",
  peering: "exposed",
  "network-acl": "security-tick",
  "network-forward": "exposed",
  pool: "storage-pool",
  volume: "storage-volume",
  "iso-volume": "iso",
  image: "image",
  "oidc-identity": "user",
  certificate: "certificate",
  "auth-group": "user-group",
  "idp-group": "user-group",
  device: "units",
  setting: "settings",
  bucket: "storage-bucket",
  "bucket-key": "private-key",
  metric: "statistics",
  "placement-group": "repository",
  replicator: "change-version",
  "token-bearer": "private-key",
};

interface Props {
  type: ResourceIconType;
  className?: string;
}

const ResourceIcon: FC<Props> = ({ type, className }) => {
  const dsIcon = dsResourceIcons[type];
  if (dsIcon) {
    return <DsIcon icon={dsIcon} className={className} />;
  }
  return <Icon name={legacyResourceIcons[type]} className={className} />;
};

export default ResourceIcon;
