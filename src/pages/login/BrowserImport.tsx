import React, { FC, useState } from "react";
import {
  Button,
  Col,
  Notification,
  Row,
  Tabs,
} from "@canonical/react-components";

const FIREFOX = "Firefox";
const CHROME_LINUX = "Chrome (Linux)";
const CHROME_WINDOWS = "Chrome (Windows)";
const EDGE = "Edge";
const MACOS = "macOS";
const TABS: string[] = [FIREFOX, CHROME_LINUX, CHROME_WINDOWS, EDGE, MACOS];

interface Props {
  sendPfx?: () => void;
}

const BrowserImport: FC<Props> = ({ sendPfx }) => {
  const [activeTab, handleTabChange] = useState(FIREFOX);

  const windowsDialogSteps = (
    <>
      <li className="p-list__item">
        This opens a certificate management dialog. Click <code>Import...</code>
        then <code>Next</code> and select the <code>lxd-ui.pfx</code> file you
        just downloaded. Confirm an empty password. Click <code>Next</code>.
      </li>
      <li className="p-list__item">
        Select <code>Automatically select the certificate store</code> and click{" "}
        <code>Next</code>, then click <code>Finish</code>.
      </li>
      <li className="p-list__item">
        Restart the browser and open LXD-UI. Select the LXD-UI certificate.
      </li>
    </>
  );

  const downloadPfx = (
    <li className="p-list__item u-clearfix">
      Download <code>lxd-ui.pfx</code>
      {sendPfx && (
        <div className="u-float-right--large">
          <Button onClick={sendPfx}>Download pfx</Button>
        </div>
      )}
    </li>
  );

  return (
    <Row>
      <Col size={8}>
        <Tabs
          links={TABS.map((tab) => ({
            label: tab,
            active: tab === activeTab,
            onClick: () => handleTabChange(tab),
          }))}
        />

        {activeTab === FIREFOX && (
          <div role="tabpanel" aria-label="firefox">
            <ul className="p-list--divided u-no-margin--bottom">
              {downloadPfx}
              <li className="p-list__item">
                Paste this link into the address bar:
                <div className="p-code-snippet u-no-margin--bottom">
                  <pre className="p-code-snippet__block">
                    <code>about:preferences#privacy</code>
                  </pre>
                </div>
              </li>
              <li className="p-list__item">
                Scroll all the way down and click the{" "}
                <code>View Certificates</code> button.
              </li>
              <li className="p-list__item">
                In the popup click <code>Your certificates</code> and then{" "}
                <code>Import</code>.
              </li>
              <li className="p-list__item">
                Select the <code>lxd-ui.pfx</code> file you just downloaded.
                Confirm an empty password.
              </li>
              <li className="p-list__item">
                Restart the browser and open LXD-UI. Select the LXD-UI
                certificate.
              </li>
            </ul>
          </div>
        )}

        {activeTab === CHROME_LINUX && (
          <div role="tabpanel" aria-label="chrome linux">
            <ul className="p-list--divided u-no-margin--bottom">
              {downloadPfx}
              <li className="p-list__item">
                Paste into the address bar:
                <div className="p-code-snippet u-no-margin--bottom">
                  <pre className="p-code-snippet__block">
                    <code>chrome://settings/certificates</code>
                  </pre>
                </div>
              </li>
              <li className="p-list__item">
                Click the <code>Import</code> button and select the{" "}
                <code>lxd-ui.pfx</code> file you just downloaded. Confirm an
                empty password.
              </li>
              <li className="p-list__item">
                Restart the browser and open LXD-UI. Select the LXD-UI
                certificate.
              </li>
            </ul>
          </div>
        )}

        {activeTab === CHROME_WINDOWS && (
          <div role="tabpanel" aria-label="chrome windows">
            <ul className="p-list--divided u-no-margin--bottom">
              {downloadPfx}
              <li className="p-list__item">
                Paste into the address bar:
                <div className="p-code-snippet u-no-margin--bottom">
                  <pre className="p-code-snippet__block">
                    <code>chrome://settings/security</code>
                  </pre>
                </div>
              </li>
              <li className="p-list__item">
                Scroll down to the <code>Advanced settings</code> and click{" "}
                <code>Manage device certificates</code>
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
                Paste into the address bar:
                <div className="p-code-snippet u-no-margin--bottom">
                  <pre className="p-code-snippet__block">
                    <code>edge://settings/privacy</code>
                  </pre>
                </div>
              </li>
              <li className="p-list__item">
                Scroll to the <code>Security</code> section and click{" "}
                <code>Manage Certificates</code>
              </li>
              {windowsDialogSteps}
            </ul>
          </div>
        )}

        {activeTab === MACOS && (
          <div role="tabpanel" aria-label="safari macos">
            <ul className="p-list--divided u-no-margin--bottom">
              <li className="p-list__item">
                <Notification
                  severity="caution"
                  className="u-no-margin--bottom"
                >
                  The certificate must be protected by password. An empty
                  password will fail to be imported on macOS.
                </Notification>
              </li>
              {downloadPfx}
              <li className="p-list__item">
                Start the Keychain Access app on your Mac, select the login
                keychain.
              </li>
              <li className="p-list__item">
                Drag the <code>lxd-ui.pfx</code> file onto the Keychain Access
                app.
              </li>
              <li className="p-list__item">
                If you are asked to provide a name and password, type the name
                and password for an administrator user on this computer.
              </li>
              <li className="p-list__item">
                Restart the browser and open LXD-UI. Select the LXD-UI
                certificate.
              </li>
            </ul>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default BrowserImport;
