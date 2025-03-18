import type { FC } from "react";
import { useState } from "react";
import PasswordModal from "./PasswordModal";
import { Button, Icon } from "@canonical/react-components";

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

  const createCert = (password: string) => {
    closeModal();
    setGenerating(true);

    const worker = new Worker(
      new URL("../../util/certificate?worker", import.meta.url),
      { type: "module" },
    );

    worker.onmessage = (event: MessageEvent<Certs>) => {
      setCerts(event.data);
      setGenerating(false);
      downloadBase64(`lxd-ui-${location.hostname}.pfx`, event.data.pfx);
      worker.terminate();
    };

    worker.onerror = (error) => {
      console.error("Web Worker error:", error);
      setGenerating(false);
      worker.terminate();
    };

    worker.postMessage(password);
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
          onClick={openModal}
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
