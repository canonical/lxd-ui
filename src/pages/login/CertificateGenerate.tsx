import React, { FC, useState } from "react";
import { generateCert } from "util/certificate";
import { Button, Col, Icon, Row } from "@canonical/react-components";
import BrowserImport from "pages/login/BrowserImport";
import { Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import Loader from "components/Loader";
import PasswordModal from "pages/login/PasswordModal";

interface Certs {
  crt: string;
  pfx: string;
}

const CertificateGenerate: FC = () => {
  const [isGenerating, setGenerating] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [certs, setCerts] = useState<Certs | null>(null);
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/ui" replace={true} />;
  }

  const closeModal = () => {
    setModalOpen(false);
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const createCert = (password: string) => {
    closeModal();
    setGenerating(true);
    // using timeout to avoid compute heavy generation in the main ui thread
    setTimeout(() => {
      const certs = generateCert(password);
      setCerts(certs);
      setGenerating(false);
    }, 10);
  };

  const downloadBase64 = (name: string, base64: string) => {
    const linkSource = `data:application/octet-stream;base64,${base64}`;
    const downloadLink = document.createElement("a");

    downloadLink.href = linkSource;
    downloadLink.download = name;
    downloadLink.click();
  };

  const downloadText = (name: string, text: string) => {
    const data = encodeURIComponent(text);
    const linkSource = `data:text/plain;charset=utf-8,${data}`;
    const downloadLink = document.createElement("a");

    downloadLink.href = linkSource;
    downloadLink.download = name;
    downloadLink.click();
  };

  return (
    <main className="l-main certificate-generate">
      <div className="p-panel">
        <div className="p-panel__header is-sticky">
          <h1 className="p-panel__title">Setup LXD UI</h1>
        </div>
        <div className="p-panel__content">
          <Row className="u-no-margin--left">
            <Col size={12}>
              <ol className="p-stepped-list--detailed">
                <li className="p-stepped-list__item">
                  <Row>
                    <Col size={3}>
                      <h2 className="p-stepped-list__title p-heading--5">
                        Generate
                      </h2>
                    </Col>
                    <Col size={6}>
                      <div className="p-stepped-list__content">
                        <p>Create a new certificate</p>
                      </div>
                    </Col>
                    <Col size={3}>
                      {isModalOpen && (
                        <PasswordModal
                          onClose={closeModal}
                          onConfirm={createCert}
                        />
                      )}
                      <Button
                        onClick={openModal}
                        appearance="positive"
                        disabled={isGenerating || certs !== null}
                        hasIcon={isGenerating}
                        aria-label={`${
                          isGenerating ? "Generating" : "Generate"
                        } certificate`}
                      >
                        {isGenerating && (
                          <Icon
                            className="is-light u-animation--spin"
                            name="spinner"
                          />
                        )}
                        <span>{isGenerating ? "Generating" : "Generate"}</span>
                      </Button>
                      {certs !== null && <Icon name="success" />}
                    </Col>
                  </Row>
                </li>
                <li className="p-stepped-list__item">
                  <Row>
                    <Col size={3}>
                      <h2 className="p-stepped-list__title p-heading--5">
                        Trust
                      </h2>
                    </Col>
                    <Col size={6}>
                      <div className="p-stepped-list__content">
                        <p>
                          Download <code>lxd-ui.crt</code> and add it to the LXD
                          trust store
                        </p>
                        <div className="p-code-snippet">
                          <pre className="p-code-snippet__block--icon">
                            <code>
                              lxc config trust add Downloads/lxd-ui.crt
                            </code>
                          </pre>
                        </div>
                      </div>
                    </Col>
                    {certs && (
                      <Col size={3}>
                        <Button
                          onClick={() => downloadText("lxd-ui.crt", certs.crt)}
                        >
                          Download crt
                        </Button>
                      </Col>
                    )}
                  </Row>
                </li>
                <li className="p-stepped-list__item">
                  <Row>
                    <Col size={3}>
                      <h2 className="p-stepped-list__title p-heading--5">
                        Import
                      </h2>
                    </Col>
                    <Col size={8}>
                      <BrowserImport
                        sendPfx={
                          certs
                            ? () => downloadBase64("lxd-ui.pfx", certs.pfx)
                            : undefined
                        }
                      />
                    </Col>
                  </Row>
                </li>
                <li className="p-stepped-list__item u-no-margin--bottom">
                  <Row>
                    <Col size={3}>
                      <h2 className="p-stepped-list__title p-heading--5">
                        Done
                      </h2>
                    </Col>
                    <Col size={6}>
                      <div className="p-stepped-list__content">
                        <p>Enjoy LXD UI.</p>
                      </div>
                    </Col>
                  </Row>
                </li>
              </ol>
            </Col>
          </Row>
        </div>
      </div>
    </main>
  );
};

export default CertificateGenerate;
