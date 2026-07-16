import { OutputField } from "@canonical/react-components";
import type { FC } from "react";
import {
  getIdentityName,
  isBearerIdentityType,
} from "util/permissionIdentities";
import type { LxdAuthGroup, LxdIdentity } from "types/permissions";
import EditIdentityGroupsSection, {
  type IdentityGroupChanges,
} from "./EditIdentityGroupsSection";
import IssueNewTokenSection from "./IssueNewTokenSection";
import { isoTimeToString } from "util/helpers";

interface Props {
  canEdit: boolean;
  groups: LxdAuthGroup[];
  identity: LxdIdentity;
  onGroupChanges: (
    changes: IdentityGroupChanges,
    nextModifiedGroups: Set<string>,
  ) => void;
}

const EditIdentityPanelContent: FC<Props> = ({
  canEdit,
  groups,
  identity,
  onGroupChanges,
}) => {
  const isBearer = isBearerIdentityType(identity.type);

  return (
    <>
      <OutputField
        id="identity-name"
        label="Name"
        value={getIdentityName(identity)}
      />
      <OutputField id="identity-id" label="ID" value={identity.id} />
      <OutputField
        id="identity-auth-method-type"
        label="Auth method"
        value={`${identity.authentication_method.toUpperCase()} - ${identity.type}`}
      />
      {isBearer && (
        <div className="u-flex u-gap--small">
          <OutputField
            id="identity-expires-at"
            label="Expires at"
            value={
              isoTimeToString(identity.expires_at ?? "") || "No active token"
            }
          />

          <div className="issue-token-button-wrapper">
            <IssueNewTokenSection identity={identity} canEdit={canEdit} />
          </div>
        </div>
      )}
      <EditIdentityGroupsSection
        identity={identity}
        groups={groups}
        canEdit={canEdit}
        onChange={onGroupChanges}
      />
    </>
  );
};

export default EditIdentityPanelContent;
