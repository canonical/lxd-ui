import forge from "node-forge";
import { generateCert, sanitizeOrgName } from "./certificate";

describe("sanitizeOrgName", () => {
  it("replaces invalid chars from an ipv6 string", () => {
    const result = sanitizeOrgName("LXD UI [::1] (Browser Generated)");

    expect(result).toBe("LXD UI ::1 (Browser Generated)");
  });

  it("keeps a valid domain name", () => {
    const result = sanitizeOrgName(
      "LXD UI foo.example.com (Browser Generated)",
    );

    expect(result).toBe("LXD UI foo.example.com (Browser Generated)");
  });

  it("keeps a valid ipv4 address", () => {
    const result = sanitizeOrgName("LXD UI 127.0.0.1 (Browser Generated)");

    expect(result).toBe("LXD UI 127.0.0.1 (Browser Generated)");
  });
});

describe("generateCert", () => {
  it("signs the certificate with sha384", () => {
    const { crt } = generateCert("secret");
    const cert = forge.pki.certificateFromPem(crt);

    expect(cert.siginfo.algorithmOid).toBe(
      forge.pki.oids.sha384WithRSAEncryption,
    );
    expect(cert.verify(cert)).toBe(true);
  });

  it("bundles the certificate in a password protected pfx", () => {
    const { crt, pfx } = generateCert("secret");
    const asn1 = forge.asn1.fromDer(forge.util.decode64(pfx));
    const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, "secret");
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const bundledCert = certBags[forge.pki.oids.certBag]?.[0].cert;

    expect(bundledCert && forge.pki.certificateToPem(bundledCert)).toBe(crt);
  });
});
