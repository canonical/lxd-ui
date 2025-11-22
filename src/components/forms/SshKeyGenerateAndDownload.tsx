import { useEffect, useState, type FC } from "react";
import { Button } from "@canonical/react-components";

interface Props {
  keyName: string;
  setSSHPublicKey: (value: string) => void;
}

const SshKeyGenerateAndDownload: FC<Props> = ({ keyName, setSSHPublicKey }) => {
  const [privateKey, setPrivateKey] = useState<CryptoKey>();
  const [publicKey, setPublicKey] = useState<CryptoKey>();
  const [isDownloaded, setIsDownloaded] = useState(false);
  const generateSSHKey = async () => {
    setSSHPublicKey("");
    const key = await window.crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-384",
      },
      true,
      ["sign", "verify"],
    );
    setPrivateKey(key.privateKey);
    setPublicKey(key.publicKey);
  };

  useEffect(() => {
    generateSSHKey();
  }, []);

  const exportEcdsaPublicKeyAsOpenSSH = (publicKey: ArrayBuffer) => {
    const key = new Uint8Array(publicKey);
    const curveName = "nistp384";
    const sshAlgo = "ecdsa-sha2-nistp384";

    const writeString = (input: string | Uint8Array): Uint8Array => {
      const data =
        typeof input === "string" ? new TextEncoder().encode(input) : input;
      const len = new Uint8Array(4);
      new DataView(len.buffer).setUint32(0, data.length, false); //big-endian
      return new Uint8Array([...len, ...data]);
    };

    const combined = new Uint8Array([
      ...writeString(sshAlgo),
      ...writeString(curveName),
      ...writeString(key),
    ]);
    const base64Key = btoa(String.fromCharCode(...combined));
    return `${sshAlgo} ${base64Key}`;
  };

  const convertToPEMFormat = (keyData: ArrayBuffer, label: string) => {
    const base64 = window.btoa(String.fromCharCode(...new Uint8Array(keyData)));
    const lines = base64.match(/.{1,64}/g)?.join("\n") ?? base64;
    return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
  };

  const downloadPEMFile = (pemString: string, filename: string) => {
    const blob = new Blob([pemString], { type: "application/x-pem-file" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setIsDownloaded(true);
  };

  const downloadPrivateKey = async () => {
    if (!privateKey || !publicKey) return;
    const privateKeyData = await window.crypto.subtle.exportKey(
      "pkcs8",
      privateKey,
    );
    const privateKeyPEM = convertToPEMFormat(privateKeyData, "EC PRIVATE KEY");
    downloadPEMFile(privateKeyPEM, `lxd-${location.hostname}-${keyName}`);
    const publicKeyDataRaw = await window.crypto.subtle.exportKey(
      "raw",
      publicKey,
    );
    const publicKeyOpenSsh = exportEcdsaPublicKeyAsOpenSSH(publicKeyDataRaw);
    setSSHPublicKey(publicKeyOpenSsh);
  };

  return (
    <>
      <p className="u-text--muted">
        {isDownloaded
          ? "Your private key was downloaded successfully."
          : "Your key pair was generated successfully."}
      </p>
      <Button disabled={!privateKey} type="button" onClick={downloadPrivateKey}>
        Download private key
      </Button>
    </>
  );
};

export default SshKeyGenerateAndDownload;
