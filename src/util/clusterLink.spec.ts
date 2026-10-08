import {
  getClusterLinksStatus,
  isPendingPublicLink,
  isValidRemoteAddress,
  normalizeRemoteAddress,
} from "util/clusterLink";
import type { LxdClusterLink, LxdClusterLinkState } from "types/cluster";
import type { LxdIdentity } from "types/permissions";

const createLink = (overrides: Partial<LxdClusterLink>): LxdClusterLink => ({
  config: {},
  description: "",
  name: "link1",
  type: "bidirectional",
  ...overrides,
});

const createState = (
  ...statuses: LxdClusterLinkState["cluster_link_members"][number]["status"][]
): LxdClusterLinkState => ({
  cluster_link_members: statuses.map((status, index) => ({
    address: `10.0.0.${index + 1}:8443`,
    server_name: `member${index + 1}`,
    status,
  })),
});

describe("normalizeRemoteAddress", () => {
  it("removes a leading http:// or https://", () => {
    expect(normalizeRemoteAddress("https://10.0.0.2:8443")).toBe(
      "10.0.0.2:8443",
    );
    expect(normalizeRemoteAddress("HTTP://lxd.example.com")).toBe(
      "lxd.example.com",
    );
  });

  it("removes surrounding whitespace and a trailing path", () => {
    expect(normalizeRemoteAddress("  https://10.0.0.2:8443/1.0  ")).toBe(
      "10.0.0.2:8443",
    );
  });

  it("returns an empty string for a missing address", () => {
    expect(normalizeRemoteAddress(undefined)).toBe("");
  });
});

describe("isValidRemoteAddress", () => {
  it.each([
    "10.0.0.2",
    "10.0.0.2:8443",
    "https://10.0.0.2:8443",
    "lxd.example.com",
    "lxd.example.com:8443",
    "localhost",
    "fd42::1",
    "[fd42::1]",
    "[fd42::1]:8443",
  ])("accepts %s", (address) => {
    expect(isValidRemoteAddress(address)).toBe(true);
  });

  it.each([
    "",
    "   ",
    "999.1.1.1",
    "10.0.0.2:0",
    "10.0.0.2:65536",
    "10.0.0.2:port",
    "not a host",
    "-lxd.example.com",
    "[fd42::1]:abc",
  ])("rejects %j", (address) => {
    expect(isValidRemoteAddress(address)).toBe(false);
  });
});

describe("isPendingPublicLink", () => {
  it("is true for a public link without confirmed addresses", () => {
    const link = createLink({
      type: "public",
      config: { "volatile.pending_address": "10.0.0.2:8443" },
    });
    expect(isPendingPublicLink(link)).toBe(true);
  });

  it("is false for a confirmed public link", () => {
    const link = createLink({
      type: "public",
      config: { "volatile.addresses": "10.0.0.2:8443" },
    });
    expect(isPendingPublicLink(link)).toBe(false);
  });

  it("is false for other link types", () => {
    expect(isPendingPublicLink(createLink({ type: "unidirectional" }))).toBe(
      false,
    );
  });
});

describe("getClusterLinksStatus", () => {
  it("returns Pending for a pending identity", () => {
    const identity = { type: "Cluster link certificate (pending)" };
    expect(getClusterLinksStatus(identity as LxdIdentity)).toBe("Pending");
  });

  it("returns Pending for an unconfirmed public link", () => {
    const link = createLink({ type: "public" });
    expect(getClusterLinksStatus(undefined, createState(), link)).toBe(
      "Pending",
    );
  });

  it("treats an unauthenticated member as reachable for a public link", () => {
    const link = createLink({
      type: "public",
      config: { "volatile.addresses": "10.0.0.1:8443" },
    });
    expect(
      getClusterLinksStatus(undefined, createState("Unauthenticated"), link),
    ).toBe("Reachable");
  });

  it("treats an unauthenticated member as unreachable for other links", () => {
    const link = createLink({ type: "unidirectional" });
    expect(
      getClusterLinksStatus(undefined, createState("Unauthenticated"), link),
    ).toBe("Unreachable");
  });

  it("returns Reachable when any member is active", () => {
    expect(
      getClusterLinksStatus(undefined, createState("Unreachable", "Active")),
    ).toBe("Reachable");
  });

  it("returns Unreachable when no member can be reached", () => {
    expect(getClusterLinksStatus(undefined, createState("Unreachable"))).toBe(
      "Unreachable",
    );
  });
});
