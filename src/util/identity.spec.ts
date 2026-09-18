import type { LxdIdentity } from "types/permissions";
import {
  isBearerIdentityType,
  isFineGrainedTls,
  isLegacyIdentity,
  isRestricted,
  isSystemIdentity,
} from "./identity";

const buildIdentity = (type: LxdIdentity["type"]): LxdIdentity => ({
  id: "id",
  type,
  name: "name",
  authentication_method: "tls",
  fine_grained: false,
});

describe("identity helpers", () => {
  describe("isRestricted", () => {
    it("returns true for restricted identities", () => {
      expect(
        isRestricted(buildIdentity("Client certificate (restricted)")),
      ).toBe(true);
      expect(
        isRestricted(buildIdentity("Metrics certificate (restricted)")),
      ).toBe(true);
    });

    it("returns false for non-restricted identities", () => {
      expect(
        isRestricted(buildIdentity("Client certificate (unrestricted)")),
      ).toBe(false);
      expect(isRestricted(buildIdentity("Client certificate"))).toBe(false);
    });
  });

  describe("isLegacyIdentity", () => {
    it("returns true for restricted identities", () => {
      expect(
        isLegacyIdentity(buildIdentity("Client certificate (restricted)")),
      ).toBe(true);
    });

    it("returns true for unrestricted identities", () => {
      expect(
        isLegacyIdentity(buildIdentity("Client certificate (unrestricted)")),
      ).toBe(true);
      expect(
        isLegacyIdentity(buildIdentity("Metrics certificate (unrestricted)")),
      ).toBe(true);
      expect(isLegacyIdentity(buildIdentity("Server certificate"))).toBe(true);
    });

    it("returns false for fine grained identities", () => {
      expect(isLegacyIdentity(buildIdentity("Client certificate"))).toBe(false);
      expect(isLegacyIdentity(buildIdentity("Client token bearer"))).toBe(
        false,
      );
      expect(isLegacyIdentity(buildIdentity("OIDC client"))).toBe(false);
    });
  });

  describe("isFineGrainedTls", () => {
    it("returns true for fine grained tls identities", () => {
      expect(isFineGrainedTls(buildIdentity("Client certificate"))).toBe(true);
      expect(
        isFineGrainedTls(buildIdentity("Client certificate (pending)")),
      ).toBe(true);
    });

    it("returns false for other identities", () => {
      expect(
        isFineGrainedTls(buildIdentity("Client certificate (restricted)")),
      ).toBe(false);
      expect(isFineGrainedTls(buildIdentity("OIDC client"))).toBe(false);
    });
  });

  describe("isSystemIdentity", () => {
    it("returns true for server and metrics certificates", () => {
      expect(isSystemIdentity(buildIdentity("Server certificate"))).toBe(true);
      expect(
        isSystemIdentity(buildIdentity("Metrics certificate (restricted)")),
      ).toBe(true);
      expect(
        isSystemIdentity(buildIdentity("Metrics certificate (unrestricted)")),
      ).toBe(true);
    });

    it("returns false for other identities", () => {
      expect(isSystemIdentity(buildIdentity("Client certificate"))).toBe(false);
      expect(isSystemIdentity(buildIdentity("OIDC client"))).toBe(false);
    });
  });

  describe("isBearerIdentityType", () => {
    it("returns true for token bearer identity types", () => {
      expect(isBearerIdentityType("Client token bearer")).toBe(true);
      expect(isBearerIdentityType("DevLXD token bearer")).toBe(true);
      expect(isBearerIdentityType("Initial UI token bearer")).toBe(true);
    });

    it("returns false for other identity types", () => {
      expect(isBearerIdentityType("Client certificate")).toBe(false);
      expect(isBearerIdentityType("OIDC client")).toBe(false);
    });
  });
});
