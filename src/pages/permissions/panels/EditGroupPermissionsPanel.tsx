import {
  ActionButton,
  Button,
  Card,
  ConfirmationModal,
  EmptyState,
  Icon,
  MainTable,
  SearchBox,
  useNotify,
} from "@canonical/react-components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SidePanel from "components/SidePanel";
import { FC, useMemo, useState } from "react";
import usePanelParams from "util/usePanelParams";
import { updateGroup } from "api/auth-groups";
import { queryKeys } from "util/queryKeys";
import PermissionSelector, { LxdPermissionWithID } from "./PermissionSelector";
import { LxdGroup } from "types/permissions";
import {
  constructResourceSelectorLabel,
  generateIdentityNamesLookup,
  generateImageNamesLookup,
  generatePermissionSort,
  getPermissionId,
} from "util/permissions";
import { useToastNotification } from "context/toastNotificationProvider";
import NotificationRow from "components/NotificationRow";
import ScrollableContainer from "components/ScrollableContainer";
import { fetchImageList } from "api/images";
import { fetchIdentities } from "api/auth-identities";
import useEditHistory from "util/useEditHistory";
import classnames from "classnames";
import ModifiedStatusAction from "../actions/ModifiedStatusAction";
import { useSettings } from "context/useSettings";
import { getIdentityIdsForGroup } from "util/permissionIdentities";
import LoggedInUserNotification from "./LoggedInUserNotification";
import { extractResourceDetailsFromUrl } from "util/resourceDetails";

type PermissionsEditHistory = {
  permissionsAdded: LxdPermissionWithID[];
  permissionsRemoved: Set<string>;
};

interface Props {
  group: LxdGroup;
}

const EditGroupPermissionsPanel: FC<Props> = ({ group }) => {
  const { data: settings } = useSettings();
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [confirming, setConfirming] = useState(false);
  const loggedInUserId = settings?.auth_user_name;
  const allIdentityIds = getIdentityIdsForGroup(group);
  const groupAllocatedToLoggedInUser = allIdentityIds.some(
    (identity) => identity === loggedInUserId,
  );

  const {
    desiredState,
    save: saveToPermissionHistory,
    undo: undoPermissionChange,
  } = useEditHistory<PermissionsEditHistory>({
    initialState: {
      permissionsAdded: [],
      permissionsRemoved: new Set(),
    },
  });

  const { data: images = [], isLoading: isImagesLoading } = useQuery({
    queryKey: [queryKeys.images],
    queryFn: () => fetchImageList(),
  });

  const { data: identities = [], isLoading: isIdentitiesLoading } = useQuery({
    queryKey: [queryKeys.identities],
    queryFn: fetchIdentities,
  });

  const getPermissions = () => {
    const existingPermissions = group.permissions ?? [];
    const permissions: LxdPermissionWithID[] = [];
    for (const permission of existingPermissions) {
      permissions.push({
        ...permission,
        id: getPermissionId(permission),
      });
    }

    for (const permission of desiredState.permissionsAdded) {
      permissions.push(permission);
    }

    return permissions;
  };

  const permissions = getPermissions();

  // a modified permission is either:
  // new permission added that is not marked as removed
  // an existing permission being removed
  const getModifiedPermissions = () => {
    const modifiedPermissions = new Set();
    const addedPermissionsLookup = new Set(
      desiredState.permissionsAdded.map((permission) => permission.id),
    );
    for (const permission of permissions) {
      const permissionAddedAndNotRemoved =
        addedPermissionsLookup.has(permission.id) &&
        !desiredState.permissionsRemoved.has(permission.id);

      const existingPermissionRemoved =
        !addedPermissionsLookup.has(permission.id) &&
        desiredState.permissionsRemoved.has(permission.id);

      if (permissionAddedAndNotRemoved) {
        modifiedPermissions.add(permission.id);
      }

      if (existingPermissionRemoved) {
        modifiedPermissions.add(permission.id);
      }
    }

    return modifiedPermissions;
  };

  const restorePermission = (permissionId: string) => {
    const permissionsRemoved = new Set(desiredState.permissionsRemoved);
    permissionsRemoved.delete(permissionId);
    saveToPermissionHistory({
      permissionsAdded: [...desiredState.permissionsAdded],
      permissionsRemoved,
    });
  };

  const addPermission = (newPermission: LxdPermissionWithID) => {
    // we should prevent user from adding the same permission again
    const permissionExists = permissions.some(
      (permission) => permission.id === newPermission.id,
    );

    if (permissionExists) {
      if (desiredState.permissionsRemoved.has(newPermission.id)) {
        restorePermission(newPermission.id);
      }
      return;
    }

    saveToPermissionHistory({
      permissionsAdded: [...desiredState.permissionsAdded, newPermission],
      permissionsRemoved: new Set(desiredState.permissionsRemoved),
    });
  };

  const deletePermission = (permissionId: string) => {
    const permissionsRemoved = new Set(desiredState.permissionsRemoved);
    permissionsRemoved.add(permissionId);
    saveToPermissionHistory({
      permissionsAdded: [...desiredState.permissionsAdded],
      permissionsRemoved,
    });
  };

  const savePermissionsWithConfirm = (confirm: boolean) => {
    if (confirm) {
      setConfirming(true);
      return;
    }

    const effectivePermissions = permissions.filter(
      (permission) => !desiredState.permissionsRemoved.has(permission.id),
    );

    const groupPayload = {
      name: group?.name,
      description: group?.description,
      permissions: effectivePermissions,
    };

    setSubmitting(true);
    updateGroup(groupPayload)
      .then(() => {
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.authGroups],
        });
        toastNotify.success(`Permissions for group ${group?.name} updated.`);
        panelParams.clear();
        notify.clear();
      })
      .catch((e) => {
        notify.failure("Failed to update permissions", e);
      })
      .finally(() => {
        setSubmitting(false);
        setConfirming(false);
      });
  };

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };
  const imageNamesLookup = generateImageNamesLookup(images);
  const identityNamesLookup = generateIdentityNamesLookup(identities);

  const filteredPermissions = search
    ? permissions.filter((permission) => {
        const resource = extractResourceDetailsFromUrl(
          permission.entity_type,
          permission.url,
          imageNamesLookup,
          identityNamesLookup,
        );
        const resourceLabel = constructResourceSelectorLabel(resource);
        return (
          permission.entitlement.includes(search) ||
          permission.entity_type.includes(search) ||
          resourceLabel.toLowerCase().includes(search)
        );
      })
    : permissions;

  const sortedPermissions = useMemo(
    () =>
      filteredPermissions.sort(
        generatePermissionSort(imageNamesLookup, identityNamesLookup),
      ),
    [filteredPermissions, imageNamesLookup, identityNamesLookup],
  );

  const modifiedPermissions = getModifiedPermissions();

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
    const resource = extractResourceDetailsFromUrl(
      permission.entity_type,
      permission.url,
      imageNamesLookup,
      identityNamesLookup,
    );

    const resourceLabel = constructResourceSelectorLabel(resource);

    const isPermissionModified = modifiedPermissions.has(permission.id);
    const isPermissionRemoved = desiredState.permissionsRemoved.has(
      permission.id,
    );

    return {
      name: permission.id,
      className: classnames("u-row", {
        strikeout: isPermissionRemoved,
      }),
      columns: [
        {
          content: permission.entity_type,
          role: "cell",
          "aria-label": "Resource type",
          className: "resource-type",
        },
        {
          content: resourceLabel,
          role: "cell",
          "aria-label": "Resource",
          className: "u-truncate resource",
          title: resourceLabel,
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
              {isPermissionRemoved ? (
                <Button
                  appearance="base"
                  hasIcon
                  dense
                  onClick={() => restorePermission(permission.id)}
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
                  onClick={() => deletePermission(permission.id)}
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
                  "hide-modified-status": !isPermissionModified,
                })}
                aria-hidden={!isPermissionModified}
                aria-label="Permission modified"
              />
            </>
          ),
          role: "cell",
          "aria-label": "Delete permission",
        },
      ],
      sortData: {
        resourceType: permission.entity_type,
        resource: resourceLabel.toLowerCase(),
        entitlement: permission.entitlement,
      },
    };
  });

  return (
    <>
      <SidePanel
        isOverlay
        loading={isImagesLoading || isIdentitiesLoading}
        hasError={false}
        className="edit-permissions-panel"
      >
        <SidePanel.Header>
          <SidePanel.HeaderTitle>{`Change permissions for ${group?.name}`}</SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <SidePanel.Content className="u-no-padding">
          <ScrollableContainer
            dependencies={[notify.notification, modifiedPermissions.size]}
            belowIds={["panel-footer"]}
          >
            <Card>
              <strong>
                <p className="u-no-margin--bottom">Add permissions</p>
              </strong>
              <span>
                Entitlements need to be given in relation to a specific
                resource. Select the appropriate resource and entitlement below
                and add it to the list of permissions for this group.
              </span>
              <PermissionSelector
                imageNamesLookup={imageNamesLookup}
                identityNamesLookup={identityNamesLookup}
                onAddPermission={addPermission}
              />
            </Card>
            <SearchBox
              externallyControlled
              value={search}
              onChange={setSearch}
            />
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
        </SidePanel.Content>
        <SidePanel.Footer className="u-align--right">
          {modifiedPermissions.size ? (
            <ModifiedStatusAction
              modifiedCount={modifiedPermissions.size}
              onUndoChange={undoPermissionChange}
              itemName="permission"
            />
          ) : null}
          <Button
            appearance="base"
            onClick={closePanel}
            className="u-no-margin--bottom"
          >
            Cancel
          </Button>
          <ActionButton
            appearance="positive"
            loading={submitting}
            onClick={() =>
              savePermissionsWithConfirm(groupAllocatedToLoggedInUser)
            }
            className="u-no-margin--bottom"
            disabled={!modifiedPermissions.size}
          >
            Save changes
          </ActionButton>
        </SidePanel.Footer>
      </SidePanel>
      {confirming && (
        <ConfirmationModal
          confirmButtonLabel="Confirm changes"
          confirmButtonAppearance="positive"
          onConfirm={() => savePermissionsWithConfirm(false)}
          close={() => setConfirming(false)}
          title="Confirm permission modification"
          className="permission-confirm-modal"
          confirmButtonLoading={submitting}
        >
          <LoggedInUserNotification isVisible />
        </ConfirmationModal>
      )}
    </>
  );
};

export default EditGroupPermissionsPanel;
