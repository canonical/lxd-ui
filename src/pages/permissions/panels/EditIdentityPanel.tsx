import { useState, type FC } from "react";
import {
  Button,
  ConfirmationModal,
  Icon,
  OutputField,
  SidePanel,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import usePanelParams from "util/usePanelParams";
import NotificationRow from "components/NotificationRow";
import { useIdentity } from "context/useIdentities";
import { useAuthGroups } from "context/useAuthGroups";
import { updateIdentity } from "api/auth-identities";
import { queryKeys } from "util/queryKeys";
import { useIdentityEntitlements } from "util/entitlements/identities";
import IdentityResource from "components/IdentityResource";
import GroupsOrIdentityChangesTable from "./GroupOrIdentityChangesTable";
import IdentityTokenConfirmModal, {
  type IdentityTokenAction,
} from "./IdentityTokenConfirmModal";
import CreateIdentityModal from "pages/permissions/CreateIdentityModal";
import {
  CREATE_IDENTITY_MODAL_TEXT,
  getChangesInGroupsForIdentities,
  getIdentityName,
  isBearerIdentityType,
  pivotIdentityGroupsChangeSummary,
  type IdentityType,
} from "util/permissionIdentities";
import type { IdentityFormValues } from "types/forms/identity";
import EditIdentityGroupsSection, {
  type IdentityGroupChanges,
} from "./EditIdentityGroupsSection";

const EditIdentityPanel: FC = () => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { canEditIdentity } = useIdentityEntitlements();

  const identityId = panelParams.editIdentityId ?? "";
  const authMethod = panelParams.editIdentityAuthMethod ?? "";
  const isQueryEnabled = Boolean(identityId && authMethod);

  const {
    data: identity,
    error,
    isLoading,
  } = useIdentity(identityId, authMethod, isQueryEnabled);

  const isGroupQueryEnabled = !!identity;
  const { data: groups = [] } = useAuthGroups(isGroupQueryEnabled);

  const [confirmingGroups, setConfirmingGroups] = useState(false);
  const [pendingGroupChanges, setPendingGroupChanges] =
    useState<IdentityGroupChanges | null>(null);
  const [savingGroups, setSavingGroups] = useState(false);
  const [tokenAction, setTokenAction] = useState<IdentityTokenAction | null>(
    null,
  );
  const [reissuedToken, setReissuedToken] = useState("");

  if (error) {
    notify.failure("Loading identity details failed", error);
  }

  if (!identity && !isLoading) {
    notify.failure(
      `Identity with ID "${identityId}" and auth method "${authMethod}" not found`,
      null,
    );
  }

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
    setPendingGroupChanges(null);
  };

  const canEdit = canEditIdentity(identity);
  const addedGroups = pendingGroupChanges?.addedGroups ?? new Set<string>();
  const removedGroups = pendingGroupChanges?.removedGroups ?? new Set<string>();

  const identityGroupsChangeSummary = identity
    ? getChangesInGroupsForIdentities([identity], addedGroups, removedGroups)
    : {};
  const groupIdentitiesChangeSummary = pivotIdentityGroupsChangeSummary(
    identityGroupsChangeSummary,
  );

  const closeGroupsConfirmModal = () => {
    setConfirmingGroups(false);
    setPendingGroupChanges(null);
  };

  const handleSaveGroups = () => {
    if (!identity || !pendingGroupChanges) {
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

  const isBearer = identity ? isBearerIdentityType(identity.type) : false;

  const closeTokenModal = () => {
    setTokenAction(null);
  };

  const handleReissueSuccess = (token: string) => {
    setReissuedToken(token);
  };

  const closeTokenDisplayModal = () => {
    setReissuedToken("");
  };

  const identityFormValues: IdentityFormValues | null = identity
    ? {
        name: identity.name || identity.id,
        groups: identity.groups ?? [],
        identityType: identity.type as IdentityType,
        expiry: "",
      }
    : null;

  const identityModalCaptions = identityFormValues
    ? CREATE_IDENTITY_MODAL_TEXT[identityFormValues.identityType]
    : undefined;

  const openGroupsConfirmModal = (changes: IdentityGroupChanges) => {
    setPendingGroupChanges(changes);
    setConfirmingGroups(true);
  };

  return (
    <>
      <SidePanel
        loading={isLoading}
        hasError={!identity && !isLoading}
        className="edit-identity-panel"
      >
        <SidePanel.Header>
          <SidePanel.HeaderTitle>Edit identity</SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <OutputField
          id="identity-name"
          label="Name"
          value={identity ? getIdentityName(identity) : ""}
        />
        <OutputField id="identity-id" label="ID" value={identity?.id ?? ""} />
        <OutputField
          id="identity-auth-method"
          label="Auth method"
          value={identity?.authentication_method.toUpperCase() ?? ""}
        />
        <OutputField
          id="identity-type"
          label="Type"
          value={identity?.type ?? ""}
        />
        {isBearer && (
          <div className="u-sv2">
            <label htmlFor="identity-token-actions">Bearer token</label>
            <div id="identity-token-actions" className="u-flex u-gap--small">
              <Button
                type="button"
                onClick={() => {
                  setTokenAction("reissue");
                }}
                disabled={!canEdit}
                title={
                  canEdit
                    ? "Issue new token"
                    : "You do not have permission to modify this identity"
                }
                className="u-no-margin--bottom"
                hasIcon
              >
                <Icon name="restart" />
                <span>Issue new token</span>
              </Button>
              <Button
                type="button"
                appearance="negative"
                onClick={() => {
                  setTokenAction("revoke");
                }}
                disabled={!canEdit}
                title={
                  canEdit
                    ? "Revoke token"
                    : "You do not have permission to modify this identity"
                }
                className="u-no-margin--bottom"
                hasIcon
              >
                <Icon name="delete" />
                <span>Revoke token</span>
              </Button>
            </div>
          </div>
        )}
        <EditIdentityGroupsSection
          identity={identity}
          isLoading={isLoading}
          groups={groups}
          canEdit={canEdit}
          notifyNotification={notify.notification}
          closePanel={closePanel}
          onSubmit={openGroupsConfirmModal}
        />
      </SidePanel>

      {confirmingGroups && identity && pendingGroupChanges && (
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

      {tokenAction && identity && (
        <IdentityTokenConfirmModal
          identity={identity}
          action={tokenAction}
          close={closeTokenModal}
          onReissueSuccess={handleReissueSuccess}
        />
      )}

      {reissuedToken && identityFormValues && identityModalCaptions && (
        <CreateIdentityModal
          onClose={closeTokenDisplayModal}
          token={reissuedToken}
          identity={identityFormValues}
          title={identityModalCaptions.codeSnippetTitle}
          notification={`${identityModalCaptions.notificationTitle} ${identityModalCaptions.notificationBody}`}
          howToUseCli={identityModalCaptions.howToUseCli?.(reissuedToken)}
          howToUseUi={identityModalCaptions.howToUseUi}
          titleSuffix="token issued successfully"
        />
      )}
    </>
  );
};

export default EditIdentityPanel;
