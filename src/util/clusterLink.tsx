import type {
  LxdClusterLink,
  LxdClusterLinkState,
  LxdClusterLinkType,
  StatusCaption,
} from "types/cluster";
import type { LxdIdentity } from "types/permissions";
import { testValidIp } from "util/networks";

// Replication needs the remote cluster to authenticate the connection, so only
// link types that present a client certificate can be used by replicators
export const REPLICATOR_CLUSTER_LINK_TYPES: LxdClusterLinkType[] = [
  "bidirectional",
  "unidirectional",
];

const HOSTNAME_PATTERN =
  /^(?=.{1,253}$)[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const isValidPortNumber = (port: string): boolean => {
  if (!/^\d{1,5}$/.test(port)) {
    return false;
  }
  const value = Number(port);
  return value >= 1 && value <= 65535;
};

const isValidHost = (host: string): boolean => {
  // a host made only of digits and dots must be a well-formed IPv4 address
  if (/^[\d.]+$/.test(host)) {
    return testValidIp(host);
  }
  return testValidIp(host) || HOSTNAME_PATTERN.test(host);
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
    return testValidIp(host) && (port === undefined || isValidPortNumber(port));
  }

  // more than one colon without brackets can only be a bare IPv6 address
  if (value.split(":").length > 2) {
    return testValidIp(value);
  }

  const [host, port] = value.split(":");
  return isValidHost(host) && (port === undefined || isValidPortNumber(port));
};

// A public link stays pending until its certificate is confirmed, which sets volatile.addresses
export const isPendingPublicLink = (link?: LxdClusterLink): boolean => {
  return link?.type === "public" && !link.config["volatile.addresses"];
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
  // public links never present a client certificate, so a reachable remote reports "Unauthenticated"
  const isPublic = link?.type === "public";
  if (
    state?.cluster_link_members.some(
      (member) =>
        member.status === "Active" ||
        (isPublic && member.status === "Unauthenticated"),
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
