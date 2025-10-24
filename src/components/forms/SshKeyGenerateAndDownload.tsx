import type { FC } from "react";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import { Button } from "@canonical/react-components";

interface Props {
  source: {
    generate: string;
  };
  setSSHKey: (value: string) => void;
}

const SshKeyGenerateAndDownload: FC<Props> = ({ source, setSSHKey }) => {
  const generateSSHKey = async () => {
    return await window.crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-384",
      },
      true,
      ["sign", "verify"],
    );
  };

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
    const blob = new Blob([pemString], { type: "application/x-pem-file " });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateAndDownloadSSHKey = async () => {
    const keyPair = await generateSSHKey();
    const privateKeyData = await window.crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey,
    );
    const publicKeyDataRaw = await window.crypto.subtle.exportKey(
      "raw",
      keyPair.publicKey,
    );

    const privateKeyPEM = convertToPEMFormat(privateKeyData, "EC PRIVATE KEY");
    const publicKeyOpenSsh = exportEcdsaPublicKeyAsOpenSSH(publicKeyDataRaw);

    setSSHKey(publicKeyOpenSsh);
    downloadPEMFile(privateKeyPEM, "lxd_ecdsa.key");
  };

  return (
    <div>
      <Button type="button" onClick={generateAndDownloadSSHKey}>
        Generate and download key pair
      </Button>
      <AutoExpandingTextArea
        placeholder="Your auto-generated public key"
        className="u-break-all"
        readOnly={true}
        cols={50}
        value={source.generate}
      />
    </div>
  );
};

export default SshKeyGenerateAndDownload;
