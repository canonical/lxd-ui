import type { FC } from "react";
import { Link } from "react-router-dom";
import { Card, Icon, List } from "@canonical/react-components";
import { useAuth } from "context/auth";
import { pluralize } from "util/helpers";
import { isLegacyIdentity } from "util/identity";
import { ROOT_PATH } from "util/rootPath";
import PermissionGroupExplanationTooltip from "pages/permissions/PermissionGroupExplanationTooltip";
import CardEmptyState from "./CardEmptyState";

const PermissionsCard: FC = () => {
  const { currentIdentity, effectiveGroups, isAuthLoading } = useAuth();
  const isAdmin = effectiveGroups?.includes("admins") ?? false;
  const isLegacy = currentIdentity && isLegacyIdentity(currentIdentity);

  if (isAuthLoading || isAdmin || isLegacy) {
    return null;
  }

  const cardClassName = "overview-card permissions";
  const cardTitle = (
    <>
      <span className="overview-card-title">
        <Icon name="user" /> Permissions
      </span>
      <PermissionGroupExplanationTooltip />
    </>
  );
  const footerLink = (
    <Link to={`${ROOT_PATH}/ui/permissions/groups`}>Auth group details</Link>
  );

  if (!effectiveGroups || effectiveGroups.length === 0) {
    return (
      <Card className={cardClassName} title={cardTitle}>
        <CardEmptyState
          title="Overview information is filtered by your auth groups"
          centered={false}
          footerLink={footerLink}
        />
      </Card>
    );
  }

  return (
    <Card className={cardClassName} title={cardTitle}>
      <p className="u-no-margin--bottom">
        Overview information is filtered by your auth groups.
      </p>
      <div>
        <span>Your {pluralize("group", effectiveGroups?.length ?? 0)}: </span>
        <List
          inline
          middot
          items={effectiveGroups}
          className="effective-groups-list u-no-margin--bottom"
        />
      </div>
      <div className="card-footer">{footerLink}</div>
    </Card>
  );
};

export default PermissionsCard;
