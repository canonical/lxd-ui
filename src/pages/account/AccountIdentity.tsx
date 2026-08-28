import type { FC } from "react";
import {
  Button,
  Col,
  CustomLayout,
  Icon,
  List,
  MainTable,
  Notification,
  Row,
} from "@canonical/react-components";
import { Link } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import PageHeader from "components/PageHeader";
import ExplanationTooltip from "components/ExplanationTooltip";
import { useAuth } from "context/auth";
import { useAuthGroups } from "context/useAuthGroups";
import { useLoggedInUser } from "context/useLoggedInUser";
import { getIdentityName } from "util/permissionIdentities";
import { isoTimeToString } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";
import type { LxdPermission } from "types/permissions";

const AccountIdentity: FC = () => {
  const { currentIdentity, isFineGrained } = useAuth();
  const { loggedInUserName, loggedInUserID } = useLoggedInUser();
  const { data: authGroups = [] } = useAuthGroups();

  const assignedGroups = currentIdentity?.groups ?? [];
  const effectiveGroups = currentIdentity?.effective_groups ?? [];
  const inheritedGroups = effectiveGroups.filter(
    (group) => !assignedGroups.includes(group),
  );
  const effectivePermissions = currentIdentity?.effective_permissions ?? [];

  const renderGroups = (groups: string[]) => {
    if (!groups.length) {
      return <span className="u-text--muted">-</span>;
    }

    return (
      <List
        inline
        middot
        items={groups}
        className="effective-groups-list u-no-margin--bottom"
      />
    );
  };

  // a permission is granted by every group of this identity that holds it
  const getGrantingGroups = (permission: LxdPermission) => {
    return authGroups
      .filter(
        (group) =>
          effectiveGroups.includes(group.name) &&
          (group.permissions ?? []).some(
            (groupPermission) =>
              groupPermission.entity_type === permission.entity_type &&
              groupPermission.url === permission.url &&
              groupPermission.entitlement === permission.entitlement,
          ),
      )
      .map((group) => group.name);
  };

  const permissionHeaders = [
    {
      content: "Entity type",
      sortKey: "entityType",
      className: "u-text--muted",
    },
    { content: "Resource", sortKey: "resource", className: "u-text--muted" },
    {
      content: "Entitlement",
      sortKey: "entitlement",
      className: "u-text--muted",
    },
    { content: "Granted by", sortKey: "grantedBy", className: "u-text--muted" },
  ];

  const permissionRows = effectivePermissions.map((permission) => {
    const grantingGroups = getGrantingGroups(permission);

    return {
      key: `${permission.entity_type}-${permission.url}-${permission.entitlement}`,
      className: "u-row",
      columns: [
        {
          content: permission.entity_type,
          role: "rowheader",
          "aria-label": "Entity type",
        },
        {
          content: permission.url,
          role: "cell",
          "aria-label": "Resource",
        },
        {
          content: permission.entitlement,
          role: "cell",
          "aria-label": "Entitlement",
        },
        {
          content: renderGroups(grantingGroups),
          role: "cell",
          "aria-label": "Granted by",
        },
      ],
      sortData: {
        entityType: permission.entity_type,
        resource: permission.url,
        entitlement: permission.entitlement,
        grantedBy: grantingGroups.join(", "),
      },
    };
  });

  const editGroupsButton = currentIdentity ? (
    <Button
      element={Link}
      to={`${ROOT_PATH}/ui/permissions/identities?panel=edit-identity&identity=${encodeURIComponent(currentIdentity.id)}`}
      appearance="base"
      className="u-no-margin--bottom"
      title="Modify groups"
      aria-label="Modify groups"
      hasIcon
    >
      <Icon name="edit" />
    </Button>
  ) : null;

  return (
    <CustomLayout
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <ExplanationTooltip
                explanation="The identity you are authenticated as, with the groups it belongs to and the permissions they grant."
                docPath="/explanation/authorization"
                docLabel="Learn more about authorization"
              >
                Identity
              </ExplanationTooltip>
            </PageHeader.Title>
          </PageHeader.Left>
        </PageHeader>
      }
      contentClassName="account-identity"
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
      {currentIdentity && (
        <>
          <Row className="section">
            <Col size={3}>
              <h2 className="p-heading--5">Groups</h2>
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
                        {renderGroups(assignedGroups)}
                        {editGroupsButton}
                      </div>
                    </div>
                    <div className="identity-group-row">
                      <span className="identity-group-label u-text--muted">
                        Inherited
                      </span>
                      <div className="identity-group-value">
                        {renderGroups(inheritedGroups)}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="identity-group-value">
                    {renderGroups(effectiveGroups)}
                    {editGroupsButton}
                  </div>
                )}
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
                <MainTable
                  className="effective-permissions-table"
                  headers={permissionHeaders}
                  rows={permissionRows}
                  sortable
                  emptyStateMsg="No permissions found"
                />
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

export default AccountIdentity;
