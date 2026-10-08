import type {
  LxdClusterLink,
  LxdClusterLinkMemberState,
  LxdClusterLinkState,
  LxdClusterLinkType,
  StatusCaption,
} from "types/cluster";
import type { LxdIdentity } from "types/permissions";
import { isIPv4 } from "@canonical/react-components";
import { testValidPort } from "util/networks";
import { isValidIPV6 } from "util/devices";
import forge from "node-forge";

// Replication needs the remote cluster to authenticate the connection, so only
// link types that present a client certificate can be used by replicators
export const REPLICATOR_CLUSTER_LINK_TYPES: LxdClusterLinkType[] = [
  "bidirectional",
  "unidirectional",
];

const HOSTNAME_PATTERN =
  /^(?=.{1,253}$)[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// testValidPort also accepts port ranges and lists, an address takes a single port
const isValidSinglePort = (port: string): boolean =>
  /^\d+$/.test(port) && testValidPort(port);

const isValidHost = (host: string): boolean => {
  // a host made only of digits and dots must be a well-formed IPv4 address
  if (/^[\d.]+$/.test(host)) {
    return isIPv4(host);
  }
  return HOSTNAME_PATTERN.test(host);
};

// Removes a leading http:// or https:// and any trailing path from an address
export const normalizeRemoteAddress = (address?: string): string => {
  return (address ?? "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "");
};

// Accepts an IP address or hostname with an optional port,
// e.g. 10.0.0.2, 10.0.0.2:8443, lxd.example.com:8443, [fd42::1]:8443
export const isValidRemoteAddress = (address?: string): boolean => {
  const value = normalizeRemoteAddress(address);
  if (!value) {
    return false;
  }

  const bracketedIpv6 = /^\[(.+)\](?::(.+))?$/.exec(value);
  if (bracketedIpv6) {
    const [, host, port] = bracketedIpv6;
    return isValidIPV6(host) && (port === undefined || isValidSinglePort(port));
  }

  // more than one colon without brackets can only be a bare IPv6 address
  if (value.split(":").length > 2) {
    return isValidIPV6(value);
  }

  const [host, port] = value.split(":");
  return isValidHost(host) && (port === undefined || isValidSinglePort(port));
};

// A public link stays pending until its certificate is confirmed, which sets volatile.addresses
export const isPendingPublicLink = (link?: LxdClusterLink): boolean => {
  return link?.type === "public" && !link.config["volatile.addresses"];
};

// SHA-256 of the DER encoded certificate, the same fingerprint LXD reports
export const getCertificateFingerprint = (pem: string): string => {
  const base64 = pem
    .replace(/-----(BEGIN|END) CERTIFICATE-----/g, "")
    .replace(/\s/g, "");
  if (!base64) {
    return "";
  }
  const digest = forge.md.sha256.create();
  digest.update(forge.util.decode64(base64));
  return digest.digest().toHex();
};

// Public links never present a client certificate, so LXD reports a reachable remote as "Unauthenticated"
const isReachableMember = (
  member: LxdClusterLinkMemberState,
  link?: LxdClusterLink,
): boolean => {
  return (
    member.status === "Active" ||
    (link?.type === "public" && member.status === "Unauthenticated")
  );
};

export const getClusterLinksStatus = (
  identity?: LxdIdentity,
  state?: LxdClusterLinkState,
  link?: LxdClusterLink,
): StatusCaption => {
  if (identity?.type.toLowerCase().includes("(pending)")) {
    return "Pending";
  }
  if (isPendingPublicLink(link)) {
    return "Pending";
  }
  if (
    state?.cluster_link_members.some((member) =>
      isReachableMember(member, link),
    )
  ) {
    return "Reachable";
  }
  return "Unreachable";
};

export const getLinkIdentity = (
  identities: LxdIdentity[],
  linkName: string | undefined | null,
) => {
  if (!linkName) return undefined;

  return identities.find(
    (identity) =>
      identity.name === linkName &&
      identity.type.startsWith("Cluster link certificate"),
  );
};
