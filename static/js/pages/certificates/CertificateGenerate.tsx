import React, { FC, useState } from "react";
import { generateCert } from "util/certificate";
import { Button, Col, Icon, Row } from "@canonical/react-components";
import BaseLayout from "components/BaseLayout";
import BrowserImport from "pages/certificates/BrowserImport";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import Loader from "components/Loader";

interface Certs {
  crt: string;
  pfx: string;
}

const CertificateGenerate: FC = () => {
  const [isGenerating, setGenerating] = useState(false);
  const [certs, setCerts] = useState<Certs | null>(null);
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const createCert = () => {
    setGenerating(true);
    // using timeout to avoid compute heavy generation in the main ui thread
    setTimeout(() => {
      const certs = generateCert();
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
    <BaseLayout title="Certificate generation">
      <Row className="p-certificate-generate">
        <ol className="p-stepped-list">
          <li className="p-stepped-list__item">
            <Row>
              <Col size={8}>
                <h3 className="p-stepped-list__title">Generate</h3>
                <div className="p-stepped-list__content">
                  <p>Click generate to create a new certificate</p>
                </div>
              </Col>
              <Col size={4}>
                <Button
                  className="u-certificate-button"
                  onClick={createCert}
                  appearance="positive"
                  disabled={isGenerating || certs !== null}
                  hasIcon={isGenerating}
                >
                  {isGenerating && (
                    <i className="p-icon--spinner is-light u-animation--spin"></i>
                  )}
                  <span>{isGenerating ? "Generating" : "Generate"}</span>
                </Button>
              </Col>
            </Row>
          </li>
          <li className="p-stepped-list__item">
            <Row>
              <Col size={8}>
                <h3 className="p-stepped-list__title">Trust</h3>
                <div className="p-stepped-list__content">
                  Download <code>lxd-ui.crt</code> and add it to the LXD trust
                  store
                  <div className="p-code-snippet">
                    <pre className="p-code-snippet__block--icon">
                      <code>lxc config trust add Downloads/lxd-ui.crt</code>{" "}
                    </pre>
                  </div>
                </div>
              </Col>
              <Col size={4}>
                {certs && (
                  <Button
                    className="u-certificate-button"
                    onClick={() => downloadText("lxd-ui.crt", certs.crt)}
                  >
                    Download crt
                  </Button>
                )}
              </Col>
            </Row>
          </li>
          <li className="p-stepped-list__item">
            <Row>
              <Col size={8}>
                <h3 className="p-stepped-list__title">Import</h3>
                <div className="p-stepped-list__content">
                  <p>
                    Download <code>lxd-ui.pfx</code> and import it into your
                    browser.
                  </p>
                  <BrowserImport />
                </div>
              </Col>
              <Col size={4}>
                {certs && (
                  <Button
                    className="u-certificate-button"
                    onClick={() => downloadBase64("lxd-ui.pfx", certs.pfx)}
                  >
                    Download pfx
                  </Button>
                )}
              </Col>
            </Row>
          </li>
          <li className="p-stepped-list__item">
            <h3 className="p-stepped-list__title">
              All done <Icon name="success" />
            </h3>
          </li>
        </ol>
      </Row>
    </BaseLayout>
  );
};

export default CertificateGenerate;
