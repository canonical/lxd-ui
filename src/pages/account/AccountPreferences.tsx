import type { FC } from "react";
import {
  Col,
  CustomLayout,
  Row,
  ThemeSwitcher,
} from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import ExplanationTooltip from "components/ExplanationTooltip";
import PageHeader from "components/PageHeader";
import LoginProjectSelect from "pages/account/LoginProjectSelect";

const AccountPreferences: FC = () => {
  return (
    <CustomLayout
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <ExplanationTooltip explanation="Preferences are stored locally in this browser. They are not bound to your LXD account and do not apply to other browsers, devices, or users.">
                Preferences
              </ExplanationTooltip>
            </PageHeader.Title>
          </PageHeader.Left>
        </PageHeader>
      }
      contentClassName="account-preferences"
    >
      <NotificationRow />
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">Theme</h2>
        </Col>
        <Col size={7}>
          <p className="u-text--muted">
            Set the UI to dark theme, light theme, or to match the system theme.
          </p>
          <ThemeSwitcher />
        </Col>
      </Row>
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">Login project</h2>
        </Col>
        <Col size={7}>
          <p className="u-text--muted">Project to display on login.</p>
          <div className="account-preference-value">
            <LoginProjectSelect />
          </div>
        </Col>
      </Row>
    </CustomLayout>
  );
};

export default AccountPreferences;
