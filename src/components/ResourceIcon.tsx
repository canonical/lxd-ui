import { Icon as VanillaIcon } from "@canonical/react-components";
import type { IconName } from "@canonical/ds-assets";
import type { FC } from "react";
import DsIcon from "components/DsIcon";

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

type VanillaResourceIconType = "bucket" | "pool" | "volume";
type DsResourceIconType = Exclude<ResourceIconType, VanillaResourceIconType>;

// Icons available in @canonical/ds-assets — rendered via DsIcon (<svg><use>).
// Move entries here from vanillaResourceIcons as ds-assets gains coverage.
const dsResourceIcons: Record<DsResourceIconType, IconName> = {
  "image-registry": "image-registries",
  network: "exposed",
  project: "folder",
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
  "iso-volume": "iso",
  image: "image",
  "oidc-identity": "user",
  certificate: "certificate",
  "auth-group": "user-group",
  "idp-group": "user-group",
  device: "units",
  setting: "settings",
  "bucket-key": "private-key",
  metric: "statistics",
  "placement-group": "repository",
  replicator: "change-version",
  "token-bearer": "private-key",
};

// Icons not yet in @canonical/ds-assets — rendered via vanilla-framework CSS.
const vanillaResourceIcons: Record<VanillaResourceIconType, string> = {
  pool: "storage-pool",
  volume: "storage-volume",
  bucket: "storage-bucket",
};

interface Props {
  type: ResourceIconType;
  className?: string;
}

const isDsResourceIcon = (type: ResourceIconType): type is DsResourceIconType =>
  type in dsResourceIcons;

const ResourceIcon: FC<Props> = ({ type, className }) => {
  if (isDsResourceIcon(type)) {
    return <DsIcon icon={dsResourceIcons[type]} className={className} />;
  }
  return (
    <VanillaIcon name={vanillaResourceIcons[type]} className={className} />
  );
};

export default ResourceIcon;
