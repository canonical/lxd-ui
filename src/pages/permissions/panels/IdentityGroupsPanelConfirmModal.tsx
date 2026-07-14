import {
  ConfirmationModal,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useState, type FC } from "react";
import type { LxdIdentity } from "types/permissions";
import {
  generateGroupAllocationsForIdentities,
  getChangesInGroupsForIdentities,
  pivotIdentityGroupsChangeSummary,
} from "util/permissionIdentities";
import GroupsOrIdentityChangesTable from "./GroupOrIdentityChangesTable";
import { updateIdentities } from "api/auth-identities";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import IdentityResource from "components/IdentityResource";
import usePanelParams from "util/usePanelParams";

interface Props {
  onConfirm: () => void;
  close: () => void;
  selectedIdentities: LxdIdentity[];
  addedGroups: Set<string>;
  removedGroups: Set<string>;
}

const IdentityGroupsPanelConfirmModal: FC<Props> = ({
  onConfirm,
  close,
  addedGroups,
  removedGroups,
  selectedIdentities,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const notify = useNotify();
  const panelParams = usePanelParams();
  const queryClient = useQueryClient();
  const toastNotify = useToastNotification();

  const identityGroupsChangeSummary = getChangesInGroupsForIdentities(
    selectedIdentities,
    addedGroups,
    removedGroups,
  );

  const groupIdentitiesChangeSummary = pivotIdentityGroupsChangeSummary(
    identityGroupsChangeSummary,
  );

  const handleSaveGroupsForIdentities = () => {
    setSubmitting(true);

    const newGroupsForIdentities = generateGroupAllocationsForIdentities(
      addedGroups,
      removedGroups,
      selectedIdentities,
    );

    const payload = selectedIdentities.map((identity) => ({
      ...identity,
      groups: newGroupsForIdentities[identity.id],
    }));

    updateIdentities(payload)
      .then(() => {
        // modifying groups should invalidate both identities and groups api queries
        queryClient.invalidateQueries({
          predicate: (query) => {
            return [queryKeys.identities, queryKeys.authGroups].includes(
              query.queryKey[0] as string,
            );
          },
        });

        const modifiedIdentityIds = Object.keys(identityGroupsChangeSummary);
        const isMultiple = modifiedIdentityIds.length > 1;
        const [firstId, firstData] =
          Object.entries(identityGroupsChangeSummary)[0] || [];
        const firstIdentityDetails = selectedIdentities.find(
          (id) => id.id === firstId,
        );

        const successMessage = isMultiple ? (
          `Updated groups for ${modifiedIdentityIds.length} identities.`
        ) : (
          <>
            Updated groups for{" "}
            {firstIdentityDetails ? (
              <IdentityResource identity={firstIdentityDetails} />
            ) : (
              firstData?.name?.trim() || firstId
            )}
            .
          </>
        );

        toastNotify.success(successMessage);
        panelParams.clear();
        notify.clear();
      })
      .catch((e) => {
        notify.failure("Update groups failed", e);
      })
      .finally(() => {
        setSubmitting(false);
        onConfirm();
      });
  };

  return (
    <ConfirmationModal
      confirmButtonLabel="Confirm changes"
      confirmButtonAppearance="positive"
      onConfirm={handleSaveGroupsForIdentities}
      close={close}
      title="Confirm modification"
      className="permission-confirm-modal"
      confirmButtonLoading={submitting}
    >
      <GroupsOrIdentityChangesTable
        identityGroupsChangeSummary={identityGroupsChangeSummary}
        groupIdentitiesChangeSummary={groupIdentitiesChangeSummary}
        identities={selectedIdentities}
        initialGroupBy="identity"
      />
    </ConfirmationModal>
  );
};

export default IdentityGroupsPanelConfirmModal;
