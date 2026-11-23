import {
  getCertificateFingerprint,
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

describe("getCertificateFingerprint", () => {
  // server certificate of a test LXD server, its fingerprint as reported by LXD
  const pem = `-----BEGIN CERTIFICATE-----
MIIB4zCCAWqgAwIBAgIRAOv3KkLIM/NrESBJvsh82g4wCgYIKoZIzj0EAwMwJDEM
MAoGA1UEChMDTFhEMRQwEgYDVQQDDAtyb290QGx4ZC12bTAeFw0yNjA5MzAwODAw
MjlaFw0zNjA5MjcwODAwMjlaMCQxDDAKBgNVBAoTA0xYRDEUMBIGA1UEAwwLcm9v
dEBseGQtdm0wdjAQBgcqhkjOPQIBBgUrgQQAIgNiAAQGjJ9Ve7s5U+slEcS9ue+t
poOIw3OD22d0UspQBI9JcPeop2dDvZu68UQXlXZX1pEqWl4YXlHuoR9WQ2jt4mDJ
jzVKCmPDiF3oR2SFY4+ozN+C/7MQDnu1bW99DxazNlGjYDBeMA4GA1UdDwEB/wQE
AwIFoDATBgNVHSUEDDAKBggrBgEFBQcDATAMBgNVHRMBAf8EAjAAMCkGA1UdEQQi
MCCCBmx4ZC12bYcEfwAAAYcQAAAAAAAAAAAAAAAAAAAAATAKBggqhkjOPQQDAwNn
ADBkAjAoARlPEIHEwdLvdmFtyMnH/VYG26t+SH8heAzJej/gS0/ei9tkVtnFSOax
e66sMIUCMGOmHXRm5htidmtOepWO6RZgMEIt+sl2OHu/4bdxDCalk9crSVIUHcup
bg1ezfVOBg==
-----END CERTIFICATE-----
`;

  it("returns an empty string when there is no certificate", () => {
    expect(getCertificateFingerprint("")).toBe("");
  });

  it("returns the SHA-256 fingerprint of the certificate", () => {
    expect(getCertificateFingerprint(pem)).toBe(
      "0674831cd3b01377365203f49196d15b8932bdc0ec3825e30da3ab15b1483727",
    );
  });
});
