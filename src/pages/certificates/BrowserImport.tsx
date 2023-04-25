import React, { FC, useState } from "react";
import { Col, Row, Tabs } from "@canonical/react-components";

const FIREFOX = "Firefox";
const CHROME_LINUX = "Chrome (Linux)";
const CHROME_WINDOWS = "Chrome (Windows)";
const TABS: string[] = [FIREFOX, CHROME_LINUX, CHROME_WINDOWS];

const BrowserImport: FC = () => {
  const [activeTab, handleTabChange] = useState(FIREFOX);

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
          <div tabIndex={0} role="tabpanel" aria-label="firefox">
            <ul className="p-list--divided u-no-margin--bottom">
              <li className="p-list__item">
                Paste this link into the address bar:
                <div className="p-code-snippet u-no-margin--bottom">
                  <pre className="p-code-snippet__block">
                    <code>about:preferences#privacy</code>{" "}
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
            </ul>
          </div>
        )}

        {activeTab === CHROME_LINUX && (
          <div tabIndex={1} role="tabpanel" aria-label="chrome linux">
            <ul className="p-list--divided u-no-margin--bottom">
              <li className="p-list__item">
                Paste into the address bar:
                <div className="p-code-snippet u-no-margin--bottom">
                  <pre className="p-code-snippet__block">
                    <code>chrome://settings/certificates</code>{" "}
                  </pre>
                </div>
              </li>

              <li className="p-list__item">
                Click the <code>Import</code> button and select the{" "}
                <code>lxd-ui.pfx</code> file you just downloaded. Confirm an
                empty password.
              </li>
            </ul>
          </div>
        )}

        {activeTab === CHROME_WINDOWS && (
          <div tabIndex={1} role="tabpanel" aria-label="chrome windows">
            <ul className="p-list--divided u-no-margin--bottom">
              <li className="p-list__item">
                Paste into the address bar:
                <div className="p-code-snippet u-no-margin--bottom">
                  <pre className="p-code-snippet__block">
                    <code>chrome://settings/security</code>{" "}
                  </pre>
                </div>
              </li>
              <li className="p-list__item">
                Scroll all the way down and click the{" "}
                <code>Manage Certificates</code> button.
              </li>
              <li className="p-list__item">
                Click the <code>Import</code> button and select the{" "}
                <code>lxd-ui.pfx</code> file you just downloaded. Confirm an
                empty password.
              </li>
            </ul>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default BrowserImport;
