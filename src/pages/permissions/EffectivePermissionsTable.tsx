import type { FC } from "react";
import { MainTable } from "@canonical/react-components";
import { useAuthGroups } from "context/useAuthGroups";
import type { LxdIdentity, LxdPermission } from "types/permissions";
import AuthGroupList from "pages/permissions/AuthGroupList";

interface Props {
  identity: LxdIdentity;
}

const EffectivePermissionsTable: FC<Props> = ({ identity }) => {
  const { data: authGroups = [] } = useAuthGroups();

  const effectiveGroups = identity.effective_groups ?? [];
  const effectivePermissions = identity.effective_permissions ?? [];

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

  const headers = [
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

  const rows = effectivePermissions.map((permission) => {
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
          content: <AuthGroupList groups={grantingGroups} />,
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

  return (
    <MainTable
      className="effective-permissions-table"
      headers={headers}
      rows={rows}
      sortable
      defaultSort="resource"
      defaultSortDirection="ascending"
      emptyStateMsg="No permissions found"
    />
  );
};

export default EffectivePermissionsTable;
