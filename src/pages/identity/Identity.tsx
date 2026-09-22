import type { FC } from "react";
import {
  Col,
  CustomLayout,
  Notification,
  Row,
  ThemeSwitcher,
} from "@canonical/react-components";
import { Link } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import PageHeader from "components/PageHeader";
import ExplanationTooltip from "components/ExplanationTooltip";
import { useAuth } from "context/auth";
import { useLoggedInUser } from "context/useLoggedInUser";
import { getIdentityName } from "util/permissionIdentities";
import { isoTimeToString } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";
import LoginProjectSelect from "pages/identity/LoginProjectSelect";
import PermissionGroupExplanationTooltip from "pages/permissions/PermissionGroupExplanationTooltip";
import AuthGroupList from "pages/permissions/AuthGroupList";
import EffectivePermissionsTable from "pages/permissions/EffectivePermissionsTable";

const Identity: FC = () => {
  const { currentIdentity, isFineGrained } = useAuth();
  const { loggedInUserName, loggedInUserID } = useLoggedInUser();

  const assignedGroups = currentIdentity?.groups ?? [];
  const effectiveGroups = currentIdentity?.effective_groups ?? [];
  const inheritedGroups = effectiveGroups.filter(
    (group) => !assignedGroups.includes(group),
  );

  const showEditGroupsHint =
    currentIdentity && isFineGrained && !inheritedGroups.length;

  const editGroupsHint = showEditGroupsHint ? (
    <p className="identity-groups-hint p-text--small u-text--muted u-no-margin--bottom">
      Edit the group assignments on the{" "}
      <Link
        to={`${ROOT_PATH}/ui/permissions/identities?panel=edit-identity&identity=${encodeURIComponent(currentIdentity.id)}`}
      >
        Identities
      </Link>{" "}
      page.
    </p>
  ) : null;

  return (
    <CustomLayout
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <ExplanationTooltip
                explanation="The identity you are authenticated as, the groups it belongs to and the permissions they grant, along with your preferences for this browser."
                docPath="/explanation/authorization"
                docLabel="Learn more about authorization"
              >
                {currentIdentity
                  ? getIdentityName(currentIdentity)
                  : loggedInUserName}
              </ExplanationTooltip>
            </PageHeader.Title>
          </PageHeader.Left>
        </PageHeader>
      }
      contentClassName="identity-page"
    >
      <NotificationRow />
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">General</h2>
        </Col>
        <Col size={7}>
          <table className="identity-details">
            <tbody>
              <tr>
                <th className="u-text--muted">Name</th>
                <td id="identity-name">
                  {currentIdentity
                    ? getIdentityName(currentIdentity)
                    : loggedInUserName}
                </td>
              </tr>
              <tr>
                <th className="u-text--muted">ID</th>
                <td id="identity-id">
                  {currentIdentity ? currentIdentity.id : loggedInUserID}
                </td>
              </tr>
              {currentIdentity && (
                <tr>
                  <th className="u-text--muted">Auth method</th>
                  <td id="identity-auth-method-type">
                    {`${currentIdentity.authentication_method.toUpperCase()} - ${currentIdentity.type}`}
                  </td>
                </tr>
              )}
              {currentIdentity?.expires_at && (
                <tr>
                  <th className="u-text--muted">Expires at</th>
                  <td id="identity-expires-at">
                    {isoTimeToString(currentIdentity.expires_at)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {!currentIdentity && (
            <Notification severity="information">
              Identity details are not available for the current authentication
              method or LXD version.
            </Notification>
          )}
        </Col>
      </Row>
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">
            <ExplanationTooltip explanation="Preferences are stored in this browser. They are not bound to your identity and do not apply to other browsers or devices.">
              Preferences
            </ExplanationTooltip>
          </h2>
        </Col>
        <Col size={7}>
          <div className="identity-preferences">
            <div className="identity-group-row">
              <span className="identity-group-label u-text--muted">Theme</span>
              <div className="identity-group-value">
                <ThemeSwitcher />
              </div>
            </div>
            <div className="identity-group-row">
              <span className="identity-group-label u-text--muted">
                Login project
              </span>
              <div className="identity-group-value identity-preference-value">
                <LoginProjectSelect />
              </div>
            </div>
          </div>
        </Col>
      </Row>
      {currentIdentity && (
        <>
          <Row className="section">
            <Col size={3}>
              <h2 className="p-heading--5">
                <PermissionGroupExplanationTooltip>
                  Auth groups
                </PermissionGroupExplanationTooltip>
              </h2>
            </Col>
            <Col size={7}>
              <div className="identity-groups">
                {inheritedGroups.length ? (
                  <>
                    <div className="identity-group-row">
                      <span className="identity-group-label u-text--muted">
                        Assigned
                      </span>
                      <div className="identity-group-value">
                        <AuthGroupList groups={assignedGroups} />
                      </div>
                    </div>
                    <div className="identity-group-row">
                      <span className="identity-group-label u-text--muted">
                        Inherited
                      </span>
                      <div className="identity-group-value">
                        <AuthGroupList groups={inheritedGroups} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="identity-group-row">
                    <div className="identity-group-value">
                      <AuthGroupList groups={effectiveGroups} />
                    </div>
                  </div>
                )}
                {editGroupsHint}
              </div>
              {inheritedGroups.length > 0 && (
                <Notification
                  severity="information"
                  className="idp-groups-notification"
                >
                  Inherited groups are granted through identity provider group
                  mappings, not on the identity itself. To change them, join or
                  leave the matching group in your identity provider, or edit
                  which LXD groups the mapping grants under{" "}
                  <Link to={`${ROOT_PATH}/ui/permissions/idp-groups`}>
                    IDP groups
                  </Link>
                  .
                </Notification>
              )}
            </Col>
          </Row>
          <Row className="section">
            <Col size={3}>
              <h2 className="p-heading--5">Effective permissions</h2>
            </Col>
            <Col size={7}>
              {isFineGrained ? (
                <EffectivePermissionsTable identity={currentIdentity} />
              ) : (
                <Notification severity="information">
                  Your identity is not fine-grained, so there are no individual
                  permissions to list. Access is determined by your certificate
                  trust level.
                </Notification>
              )}
            </Col>
          </Row>
        </>
      )}
    </CustomLayout>
  );
};

export default Identity;
