import forge from "node-forge";

const getRandomBytes = (n: number) => {
  const crypto = self.crypto;
  const QUOTA = 65536;
  const a = new Uint8Array(n);
  for (let i = 0; i < n; i += QUOTA) {
    crypto.getRandomValues(a.subarray(i, i + Math.min(n - i, QUOTA)));
  }
  return a;
};

const details = [
  {
    name: "countryName",
    value: "AU",
  },
  {
    shortName: "ST",
    value: "Some-State",
  },
  {
    name: "organizationName",
    value: "Browser Generated LXD UI",
  },
];

export const generateCert = (password: string) => {
  const validDays = 1000;

  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;

  // @ts-expect-error toString can have an argument
  cert.serialNumber = "01" + getRandomBytes(19).toString(16);
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * validDays
  );
  cert.setSubject(details);
  cert.setIssuer(details);
  cert.sign(keys.privateKey);

  const crt = forge.pki.certificateToPem(cert);

  const asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], password, {
    algorithm: "3des", // would like to use aes, but macOS keychain only supports 3des
    generateLocalKeyId: true,
    friendlyName: "LXD-UI",
  });
  const der = forge.asn1.toDer(asn1).getBytes();
  const pfx = forge.util.encode64(der);

  return {
    crt: crt,
    pfx: pfx,
  };
};
