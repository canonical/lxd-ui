import { useEffect, useState, type FC } from "react";
import {
  ConfirmationModal,
  ScrollableContainer,
  SidePanel,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import usePanelParams from "util/usePanelParams";
import NotificationRow from "components/NotificationRow";
import { useAuthGroups } from "context/useAuthGroups";
import { updateIdentity } from "api/auth-identities";
import { queryKeys } from "util/queryKeys";
import { useIdentityEntitlements } from "util/entitlements/identities";
import IdentityResource from "components/IdentityResource";
import GroupsOrIdentityChangesTable from "./GroupOrIdentityChangesTable";
import {
  getChangesInGroupsForIdentities,
  pivotIdentityGroupsChangeSummary,
} from "util/permissionIdentities";
import { type IdentityGroupChanges } from "./EditIdentityGroupsSection";
import EditIdentityPanelContent from "./EditIdentityPanelContent";
import GroupSelectionActions from "../actions/GroupSelectionActions";
import type { LxdIdentity } from "types/permissions";
import { useEscCallback } from "context/useEscCallback";

interface Props {
  identity: LxdIdentity;
  onClose: () => void;
}

const EditIdentityPanel: FC<Props> = ({ identity, onClose }) => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { canEditIdentity } = useIdentityEntitlements();

  const {
    data: groups = [],
    error: groupsError,
    isLoading: isGroupLoading,
  } = useAuthGroups();

  useEffect(() => {
    if (groupsError) {
      notify.failure("Loading panel details failed", groupsError);
    }
  }, [groupsError]);

  const [confirmingGroups, setConfirmingGroups] = useState(false);
  const [pendingGroupChanges, setPendingGroupChanges] =
    useState<IdentityGroupChanges | null>(null);
  const [savingGroups, setSavingGroups] = useState(false);
  const [currentGroupChanges, setCurrentGroupChanges] =
    useState<IdentityGroupChanges | null>(null);
  const [modifiedGroups, setModifiedGroups] = useState<Set<string>>(new Set());

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
    setPendingGroupChanges(null);
    setCurrentGroupChanges(null);
    setModifiedGroups(new Set());
    onClose();
  };

  useEscCallback(closePanel);

  const canEdit = canEditIdentity(identity);
  const addedGroups = pendingGroupChanges?.addedGroups ?? new Set<string>();
  const removedGroups = pendingGroupChanges?.removedGroups ?? new Set<string>();

  const identityGroupsChangeSummary = getChangesInGroupsForIdentities(
    [identity],
    addedGroups,
    removedGroups,
  );
  const groupIdentitiesChangeSummary = pivotIdentityGroupsChangeSummary(
    identityGroupsChangeSummary,
  );

  const closeGroupsConfirmModal = () => {
    setConfirmingGroups(false);
    setPendingGroupChanges(null);
  };

  const handleSaveGroups = () => {
    if (!pendingGroupChanges) {
      notify.failure(
        "Update groups failed",
        new Error("No pending group changes are available"),
      );
      return;
    }

    setSavingGroups(true);
    updateIdentity({
      ...identity,
      groups: Array.from(pendingGroupChanges.currentGroups),
    })
      .then(() => {
        queryClient.invalidateQueries({
          predicate: (query) => {
            return [queryKeys.identities, queryKeys.authGroups].includes(
              query.queryKey[0] as string,
            );
          },
        });
        toastNotify.success(
          <>
            Updated groups for{" "}
            <IdentityResource identity={identity} variant="label" />.
          </>,
        );
        closePanel();
      })
      .catch((e) => {
        notify.failure("Update groups failed", e);
      })
      .finally(() => {
        setSavingGroups(false);
      });
  };

  const openGroupsConfirmModal = () => {
    if (!currentGroupChanges) {
      return;
    }

    setPendingGroupChanges(currentGroupChanges);
    setConfirmingGroups(true);
  };

  return (
    <>
      <SidePanel className="edit-identity-panel">
        <SidePanel.Header>
          <SidePanel.HeaderTitle>Edit identity</SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <SidePanel.Content className="u-no-padding">
          <ScrollableContainer
            dependencies={[
              notify.notification,
              identity,
              groups,
              modifiedGroups.size,
            ]}
            belowIds={["panel-footer"]}
          >
            <EditIdentityPanelContent
              canEdit={canEdit}
              groups={groups}
              identity={identity}
              onGroupChanges={(changes, nextModifiedGroups) => {
                setCurrentGroupChanges(changes);
                setModifiedGroups(nextModifiedGroups);
              }}
            />
          </ScrollableContainer>
        </SidePanel.Content>
        <SidePanel.Footer className="u-align--right">
          <div id="panel-footer">
            <GroupSelectionActions
              modifiedGroups={modifiedGroups}
              closePanel={closePanel}
              onSubmit={openGroupsConfirmModal}
              disabled={
                modifiedGroups.size === 0 ||
                !canEdit ||
                isGroupLoading ||
                !!groupsError
              }
            />
          </div>
        </SidePanel.Footer>
      </SidePanel>

      {confirmingGroups && pendingGroupChanges && (
        <ConfirmationModal
          title="Confirm modification"
          confirmButtonLabel="Confirm changes"
          confirmButtonAppearance="positive"
          onConfirm={handleSaveGroups}
          close={closeGroupsConfirmModal}
          confirmButtonLoading={savingGroups}
          className="permission-confirm-modal"
        >
          <GroupsOrIdentityChangesTable
            identityGroupsChangeSummary={identityGroupsChangeSummary}
            groupIdentitiesChangeSummary={groupIdentitiesChangeSummary}
            identities={[identity]}
            initialGroupBy="identity"
          />
        </ConfirmationModal>
      )}
    </>
  );
};

export default EditIdentityPanel;
