import type { FC } from "react";
import { useState } from "react";
import PasswordModal from "./PasswordModal";
import { Button, Icon } from "@canonical/react-components";
import * as asn1js from "asn1js";
import * as pkijs from "pkijs";

interface Certs {
  crt: string;
  pfx: string;
}

interface Props {
  isPasswordRequired?: boolean;
}

const CertificateGenerateBtn: FC<Props> = ({ isPasswordRequired }) => {
  const [isGenerating, setGenerating] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [certs, setCerts] = useState<Certs | null>(null);

  const closeModal = () => {
    setModalOpen(false);
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const createCert = (password: string) => {    // Utility: Convert ArrayBuffer to Base64 with proper chunking
    function arrayBufferToBase64(buffer) {
      let binary = "";
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }

    // Utility: Format PEM with 64-character line breaks
    function formatPEM(base64String, type) {
      const lines = base64String.match(/.{1,64}/g).join("\n");
      return `-----BEGIN ${type}-----\n${lines}\n-----END ${type}-----\n`;
    }

    // Utility: Download a file
    function downloadFile(
      filename,
      content,
      type = "application/octet-stream",
    ) {
      const blob = new Blob([content], { type });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // Generate an ECDSA key pair
    async function generateECDSAKeyPair() {
      return await window.crypto.subtle.generateKey(
        { name: "ECDSA", namedCurve: "P-384" },
        true,
        ["sign", "verify"],
      );
    }

    // Create a self-signed certificate
    async function createCertificate() {
      const keyPair = await generateECDSAKeyPair();
      const cert = new pkijs.Certificate();

      cert.serialNumber = new asn1js.Integer({ value: Date.now() });
      cert.issuer.typesAndValues.push(
        new pkijs.AttributeTypeAndValue({
          type: "2.5.4.3", // Common Name (CN)
          value: new asn1js.PrintableString({ value: "example.com" }),
        }),
      );
      cert.subject.typesAndValues = cert.issuer.typesAndValues;
      cert.notBefore.value = new Date();
      cert.notAfter.value = new Date();
      cert.notAfter.value.setFullYear(cert.notBefore.value.getFullYear() + 1);

      // Correctly import the Subject Public Key
      const spkiExported = await crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey,
      );
      const asn1 = asn1js.fromBER(spkiExported);
      await cert.subjectPublicKeyInfo.fromSchema(asn1.result);

      // Sign the certificate
      await cert.sign(keyPair.privateKey, "SHA-384");

      // Export keys and certificate
      const publicKeyExport = await crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey,
      );
      const privateKeyExport = await crypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey,
      );
      const certDer = cert.toSchema().toBER(false);
      const certPem = formatPEM(arrayBufferToBase64(certDer), "CERTIFICATE");

      //
      //
      const pfx = new pkijs.PFX();

      // Convert the certificate and private key into appropriate bags
      const certBag = new pkijs.CertBag({
        parsedValue: cert,
      });

      const keyBag = new pkijs.KeyBag({
        parsedValue: keyPair.privateKey,
      });

      // Create SafeBags for PFX container
      const safeBags = [
        new pkijs.SafeBag({
          bagId: "1.2.840.113549.1.12.10.1.3", // certBag
          bagValue: certBag,
        }),
        new pkijs.SafeBag({
          bagId: "1.2.840.113549.1.12.10.1.1", // keyBag
          bagValue: keyBag,
        }),
      ];

      // Add SafeBags to the PFX AuthSafe (the container)
      const safeContents = new pkijs.SafeContents({
        safeBags: safeBags,
      });

      pfx.authSafe = new pkijs.ContentInfo({
        contentType: "1.2.840.113549.1.7.1", // Data type
        content: safeContents.toSchema(),
      });

      await pfx.parsedValue?.authenticatedSafe?.makeInternalValues({
        safeContents: [
          {
            password: password,
            contentEncryptionAlgorithm: {
              name: "AES-CBC",
              length: 128,
            },
            hmacHashAlgorithm: "SHA-256",
            iterationCount: 2048,
          },
        ],
      });

      // Export PFX to DER format (Binary)
      const pfxDer = pfx.toSchema().toBER(false);
      downloadFile("ecdsa_certificate.pfx", pfxDer, "application/octet-stream");
      //
      //

      return {
        privateKeyPem: formatPEM(
          arrayBufferToBase64(privateKeyExport),
          "PRIVATE KEY",
        ),
        publicKeyPem: formatPEM(
          arrayBufferToBase64(publicKeyExport),
          "PUBLIC KEY",
        ),
        certificatePem: certPem,
        certificateDer: certDer,
      };
    }

    // Run and export
    createCertificate().then((result) => {
      console.log("Private Key (PEM):", result.privateKeyPem);
      console.log("Public Key (PEM):", result.publicKeyPem);
      console.log("Certificate (PEM):", result.certificatePem);

      // Offer downloads
      downloadFile(
        "ecdsa_certificate.pem",
        result.certificatePem,
        "text/plain",
      );
      // downloadFile("ecdsa_certificate.der", result.certificateDer);
    });
  };

  const downloadBase64 = (name: string, base64: string) => {
    const linkSource = `data:application/octet-stream;base64,${base64}`;
    const downloadLink = document.createElement("a");

    downloadLink.href = linkSource;
    downloadLink.download = name;
    downloadLink.click();
  };

  return (
    <>
      {isModalOpen && (
        <PasswordModal
          onClose={closeModal}
          onConfirm={createCert}
          isPasswordRequired={isPasswordRequired}
        />
      )}
      <div>
        <Button
          onClick={() => {
            createCert("");
          }}
          disabled={isGenerating || certs !== null}
          className="u-no-margin--bottom"
          hasIcon
          aria-label={`${isGenerating ? "Generating" : "Generate"} certificate`}
        >
          {isGenerating ? (
            <Icon className="u-animation--spin" name="spinner" />
          ) : (
            <Icon name="begin-downloading" alt="download" />
          )}
          <span>{isGenerating ? "Generating" : "Generate certificate"}</span>
        </Button>
        {certs !== null && <Icon name="success" />}
      </div>
    </>
  );
};

export default CertificateGenerateBtn;
