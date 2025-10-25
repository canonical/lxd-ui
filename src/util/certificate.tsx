import forge from "node-forge";

self.onmessage = (event: MessageEvent<string>) => {
  const result = generateCert(event.data);
  self.postMessage(result);
};

const getRandomBytes = (n: number) => {
  const crypto = self.crypto;
  const QUOTA = 65536;
  const a = new Uint8Array(n);
  for (let i = 0; i < n; i += QUOTA) {
    crypto.getRandomValues(a.subarray(i, i + Math.min(n - i, QUOTA)));
  }
  return a;
};

export const sanitizeOrgName = (orgName: string) => {
  return orgName.replace(/[^a-zA-Z0-9 '()+,-./:=?]/g, "");
};

const details = [
  {
    name: "organizationName",
    value: sanitizeOrgName(`LXD UI ${location.hostname} (Browser Generated)`),
  },
];

const generateCert = (password: string) => {
  const validDays = 1000;

  const keys = forge.pki.rsa.generateKeyPair(2048 * 2);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;

  cert.serialNumber = "01" + getRandomBytes(20).toString().substring(0, 30);
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * validDays,
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
