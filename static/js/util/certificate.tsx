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

export const generateCert = () => {
  const validityDays = 1000;

  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;

  // NOTE: serialNumber is the hex encoded value of an ASN.1 INTEGER.
  // Conforming CAs should ensure serialNumber is:
  // - no more than 20 octets
  // - non-negative (prefix a '00' if your value starts with a '1' bit)
  //cert.serialNumber = "01" + getRandomBytes(19).toString("hex"); // 1 octet = 8 bits = 1 byte = 2 hex chars
  // @ts-expect-error
  cert.serialNumber = "01" + getRandomBytes(19).toString(16); // 1 octet = 8 bits = 1 byte = 2 hex chars
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date(
    new Date().getTime() + 1000 * 60 * 60 * 24 * validityDays
  );
  const attrs = [
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
      value: "Internet Widgits Pty Ltd",
    },
  ];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);

  // self-sign certificate
  cert.sign(keys.privateKey);

  // convert a Forge certificate and private key to PEM
  const pem = forge.pki.certificateToPem(cert);
  const key = forge.pki.privateKeyToPem(keys.privateKey);

  // const asnCert = forge.pki.certificateToAsn1(cert);
  // const asnKey = forge.pki.privateKeyToAsn1(keys.privateKey);
  // const pkcs12 = forge.pkcs12.pkcs12FromAsn1(asn);

  const newPkcs12Asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], "", {
    generateLocalKeyId: true,
    friendlyName: "test",
  });
  const newPkcs12Der = forge.asn1.toDer(newPkcs12Asn1).getBytes();
  console.log("\nBase64-encoded new PKCS#12:");

  console.log(forge.util.encode64(newPkcs12Der));

  return {
    cert: pem,
    key: key,
    pkcs12: newPkcs12Der,
  };
};
