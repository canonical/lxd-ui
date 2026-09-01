import type { FC } from "react";
import { Link } from "react-router-dom";
import { Card, List } from "@canonical/react-components";
import { useAuth } from "context/auth";
import { isUnrestricted, pluralize } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";
import DsIcon from "components/DsIcon";

const PermissionsCard: FC = () => {
  const { currentIdentity, effectiveGroups, isAuthLoading } = useAuth();
  const isAdmin = effectiveGroups?.includes("admins") ?? false;
  const isUnrestrictedCert = currentIdentity && isUnrestricted(currentIdentity);
  const hasFullPermissions = isAdmin || isUnrestrictedCert;

  if (isAuthLoading || hasFullPermissions) {
    return null;
  }

  const cardClassName = "overview-card permissions";
  const cardTitle = (
    <span className="overview-card-title">
      <DsIcon icon="user" /> Permissions
    </span>
  );

  return (
    <Card className={cardClassName} title={cardTitle}>
      <p className="u-no-margin--bottom">
        Overview information is filtered by your auth groups.
      </p>
      <div>
        <span>Your {pluralize("group", effectiveGroups?.length ?? 0)}: </span>
        {effectiveGroups?.length ? (
          <List
            inline
            middot
            items={effectiveGroups}
            className="effective-groups-list u-no-margin--bottom"
          />
        ) : (
          <span className="u-text--muted">-</span>
        )}
      </div>
      <div className="card-footer">
        <Link to={`${ROOT_PATH}/ui/permissions/groups`}>
          Auth group details
        </Link>
      </div>
    </Card>
  );
};

export default PermissionsCard;
