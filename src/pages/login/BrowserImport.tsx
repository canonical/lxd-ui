import type { FC } from "react";
import { useState } from "react";
import { Col, Row, Tabs } from "@canonical/react-components";
import CertificateGenerateBtn from "./CertificateGenerateBtn";

const FIREFOX = "Firefox";
const CHROME_LINUX = "Chrome on Linux";
const CHROME_WINDOWS = "Chrome on Windows";
const EDGE = "Microsoft Edge";
const MACOS = "macOS";
const TABS: string[] = [FIREFOX, CHROME_LINUX, CHROME_WINDOWS, EDGE, MACOS];

const BrowserImport: FC = () => {
  const [activeTab, handleTabChange] = useState(FIREFOX);

  const windowsDialogSteps = (
    <>
      <li className="p-list__item">
        In the modal that appears, click <b>Import...</b>
      </li>
      <li className="p-list__item">
        Follow the instructions in the Certificate Import Wizard. When prompted
        with <b>File to Import</b>, click <b>Browse</b> and choose the
        certificate you downloaded. In order to see the certificate file, ensure
        that the file type picker is set to{" "}
        <b>Personal Information Exchange (*.pfx;*.p12)</b>.
      </li>
      <li className="p-list__item">
        <b>Restart the browser.</b>
      </li>
    </>
  );

  const downloadPfx = (
    <li className="p-list__item u-clearfix">
      Create and download a client certificate:
      <CertificateGenerateBtn isPasswordRequired={activeTab === MACOS} />
    </li>
  );

  return (
    <Row>
      <Col size={10}>
        <Tabs
          links={TABS.map((tab) => ({
            label: tab,
            active: tab === activeTab,
            onClick: () => {
              handleTabChange(tab);
            },
          }))}
        />

        {activeTab === FIREFOX && (
          <div role="tabpanel" aria-label="firefox">
            <ul className="p-list--divided u-no-margin--bottom">
              {downloadPfx}
              <li className="p-list__item">
                Go to Firefox’s privacy settings:
                <pre className="p-code-snippet__block u-no-margin--bottom">
                  <code>about:preferences#privacy</code>
                </pre>
              </li>
              <li className="p-list__item">
                Scroll down to the certificates section and click{" "}
                <b>View Certificates</b>
              </li>
              <li className="p-list__item">
                In the modal that appears, go to Your <b>certificates</b> and
                click Import
              </li>
              <li className="p-list__item">
                Select the file you just downloaded (ending in .pfx). If you
                created a password for the certificate, type it in now.
              </li>
              <li className="p-list__item">
                <b>Restart the browser.</b>
              </li>
            </ul>
          </div>
        )}

        {activeTab === CHROME_LINUX && (
          <div role="tabpanel" aria-label="chrome linux">
            <ul className="p-list--divided u-no-margin--bottom">
              {downloadPfx}
              <li className="p-list__item">
                Go to Chrome&apos;s certificate settings:
                <pre className="p-code-snippet__block u-no-margin--bottom">
                  <code>chrome://settings/certificates</code>
                </pre>
              </li>
              <li className="p-list__item">
                Click <b>Import</b>
              </li>
              <li className="p-list__item">
                Select the file you just downloaded (ending in .pfx). If you
                created a password for the certificate, type it in now.
              </li>
              <li className="p-list__item">
                <b>Restart the browser.</b>
              </li>
            </ul>
          </div>
        )}

        {activeTab === CHROME_WINDOWS && (
          <div role="tabpanel" aria-label="chrome windows">
            <ul className="p-list--divided u-no-margin--bottom">
              {downloadPfx}
              <li className="p-list__item">
                Go to Chrome&apos;s certificate settings:
                <pre className="p-code-snippet__block u-no-margin--bottom">
                  <code>chrome://settings/certificates</code>
                </pre>
              </li>
              <li className="p-list__item">
                Near the bottom of the page, click <b>Manage certificates</b>
              </li>
              <li className="p-list__item">
                Make sure{" "}
                <b>
                  Use imported local certificates from your operating system
                </b>{" "}
                is toggled on, and click{" "}
                <b>Manage imported certificates from Windows</b>{" "}
              </li>
              {windowsDialogSteps}
            </ul>
          </div>
        )}

        {activeTab === EDGE && (
          <div role="tabpanel" aria-label="edge windows">
            <ul className="p-list--divided u-no-margin--bottom">
              {downloadPfx}
              <li className="p-list__item">
                Go to Edge&apos;s certificate settings:
                <pre className="p-code-snippet__block u-no-margin--bottom">
                  <code>edge://settings/privacy</code>
                </pre>
              </li>
              <li className="p-list__item">
                Under <b>Security</b>, click <b>Manage certificates</b>
              </li>
              {windowsDialogSteps}
            </ul>
          </div>
        )}

        {activeTab === MACOS && (
          <div role="tabpanel" aria-label="safari macos">
            <ul className="p-list--divided u-no-margin--bottom">
              {downloadPfx}
              <li className="p-list__item">
                Launch the <b>Keychain Access app</b> (you will need to
                authenticate using your mac’s login credentials)
              </li>
              <li className="p-list__item">
                Import the certificate file that was created earlier. This can
                be done either by dragging the file from Finder onto Keychain
                Access, or with <b> File &gt; Import Items...</b>
              </li>
              <li className="p-list__item">
                Unlock the certificate by typing in the password used to create
                it.
              </li>
              <li className="p-list__item">
                <b>Restart the browser.</b>
              </li>
            </ul>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default BrowserImport;
