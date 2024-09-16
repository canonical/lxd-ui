import {
  Button,
  Card,
  EmptyState,
  Icon,
  MainTable,
  SearchBox,
  useNotify,
} from "@canonical/react-components";
import { FC, useMemo, useState } from "react";
import PermissionSelector from "./PermissionSelector";
import {
  getPermissionIds,
  permissionSort,
  getPermissionId,
} from "util/permissions";
import ScrollableContainer from "components/ScrollableContainer";
import classnames from "classnames";
import { LxdGroup, LxdPermission } from "types/permissions";

export type FormPermission = LxdPermission & {
  id?: string;
  isRemoved?: boolean;
  isAdded?: boolean;
  resourceLabel?: string;
};

interface Props {
  permissions: FormPermission[];
  setPermissions: (permissions: FormPermission[]) => void;
  group?: LxdGroup;
}

const EditGroupPermissionsForm: FC<Props> = ({
  permissions,
  setPermissions,
  group,
}) => {
  const notify = useNotify();
  const [search, setSearch] = useState("");

  const addPermission = (newPermission: FormPermission) => {
    const permissionExists = permissions.find(
      (permission) => permission.id === newPermission.id,
    );

    // we should prevent user from adding the same permission again
    if (permissionExists && !permissionExists.isRemoved) {
      return;
    }

    const groupPermissionIds = getPermissionIds(group?.permissions ?? []);
    const wasInGroup = groupPermissionIds.includes(newPermission.id ?? "");
    const addMe = { ...newPermission, isAdded: !wasInGroup, isRemoved: false };

    if (permissionExists && permissionExists.isRemoved) {
      const updatedPermissions = permissions.map((permission) =>
        permission.id === newPermission.id ? addMe : permission,
      );
      setPermissions(updatedPermissions);
      return;
    }

    if (!permissionExists) {
      setPermissions([...permissions, addMe]);
    }
  };

  const deletePermission = (permissionId: string) => {
    let updatedPermissions: FormPermission[];
    const existingPermission = group?.permissions?.some(
      (p) => getPermissionId(p) === permissionId,
    );
    if (existingPermission) {
      updatedPermissions = permissions.map((permission) =>
        permission.id === permissionId
          ? { ...permission, isRemoved: true, isAdded: false }
          : permission,
      );
    } else {
      updatedPermissions = permissions.filter(
        (permission) => permission.id !== permissionId,
      );
    }
    setPermissions(updatedPermissions);
  };

  const filteredPermissions = search
    ? permissions.filter((permission) => {
        return (
          permission.entitlement.includes(search) ||
          permission.entity_type.includes(search) ||
          permission.resourceLabel?.toLowerCase().includes(search)
        );
      })
    : permissions;

  const sortedPermissions = useMemo(
    () => filteredPermissions.sort(permissionSort),
    [filteredPermissions],
  );

  const headers = [
    {
      content: "Resource type",
      sortKey: "resourceType",
      className: "resource-type",
    },
    { content: "Resource", sortKey: "resource", className: "resource" },
    {
      content: "Entitlement",
      sortKey: "entitlement",
      className: "entitlement",
    },
    { "aria-label": "Actions", className: "u-align--right actions" },
  ];

  const rows = sortedPermissions.map((permission) => {
    const isModified = permission.isAdded || permission.isRemoved;

    return {
      name: permission.id,
      className: classnames("u-row", {
        strikeout: permission.isRemoved,
      }),
      columns: [
        {
          content: permission.entity_type,
          role: "cell",
          "aria-label": "Resource type",
          className: "resource-type",
        },
        {
          content: permission.resourceLabel,
          role: "cell",
          "aria-label": "Resource",
          className: "u-truncate resource",
          title: permission.resourceLabel,
        },
        {
          content: permission.entitlement,
          role: "cell",
          "aria-label": "Entitlement",
          className: "u-truncate entitlement",
          title: permission.entitlement,
        },
        {
          className: "actions u-align--right",
          content: (
            <>
              {permission.isRemoved ? (
                <Button
                  appearance="base"
                  hasIcon
                  dense
                  onClick={() => addPermission(permission)}
                  type="button"
                  aria-label="Restore permission"
                  title="Restore permission"
                  className="u-no-margin--right"
                >
                  <Icon name="restart" className="u-no-margin--right" />
                </Button>
              ) : (
                <Button
                  appearance="base"
                  hasIcon
                  dense
                  onClick={() => deletePermission(permission.id ?? "")}
                  type="button"
                  aria-label="Delete permission"
                  title="Delete permission"
                  className="u-no-margin--right"
                >
                  <Icon name="delete" className="u-no-margin--right" />
                </Button>
              )}
              <Icon
                name="status-in-progress-small"
                className={classnames({
                  "hide-modified-status": !isModified,
                })}
                aria-hidden={!isModified}
                aria-label="Permission modified"
              />
            </>
          ),
          role: "cell",
          "aria-label": "Delete permission",
        },
      ],
      sortData: {
        resourceType: permission.entity_type.toLowerCase(),
        resource: permission.resourceLabel?.toLowerCase(),
        entitlement: permission.entitlement.toLowerCase(),
      },
    };
  });

  return (
    <ScrollableContainer
      dependencies={[notify.notification, permissions.length]}
      belowIds={["panel-footer"]}
    >
      <Card>
        <strong>
          <p className="u-no-margin--bottom">Add permissions</p>
        </strong>
        <span>
          Entitlements need to be given in relation to a specific resource.
          Select the appropriate resource and entitlement below and add it to
          the list of permissions for this group.
        </span>
        <PermissionSelector onAddPermission={addPermission} />
      </Card>
      <SearchBox externallyControlled value={search} onChange={setSearch} />
      {!permissions.length ? (
        <EmptyState
          className="empty-state empty-state__full-width"
          image={<Icon name="plans" className="empty-state-icon" />}
          title="No permissions"
        >
          <p>Select a permission above and add to the group</p>
        </EmptyState>
      ) : (
        <MainTable
          id="permissions-table"
          headers={headers}
          sortable
          emptyStateMsg={"No permissions match the search criteria."}
          rows={rows}
          className="permissions-table"
        />
      )}
    </ScrollableContainer>
  );
};

export default EditGroupPermissionsForm;
