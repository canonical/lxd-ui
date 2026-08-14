import { List, Tooltip } from "@canonical/react-components";
import { type FC } from "react";
import { useSettings } from "context/useSettings";
import { useAuth } from "context/auth";
import type { LxdIdentity } from "types/permissions";
import { pluralize } from "util/helpers";

interface Props {
  identity: LxdIdentity;
}

const IdentityAdditionalIdpGroups: FC<Props> = ({ identity }) => {
  const { effectiveGroups: loggedInIdentityEffectiveGroups } = useAuth();
  const { data: settings } = useSettings();
  const isLoggedInIdentity = settings?.auth_user_name === identity.id;

  if (!isLoggedInIdentity || !loggedInIdentityEffectiveGroups) {
    return null;
  }

  const existingGroups = new Set(identity.groups ?? []);
  const additionalIdpGroups = loggedInIdentityEffectiveGroups.filter(
    (g) => !existingGroups.has(g),
  );

  if (additionalIdpGroups.length === 0) {
    return null;
  }

  return (
    <Tooltip
      className="u-margin-left--small"
      message={
        <>
          Additional LXD groups from Identity provider group mappings:
          <List className="u-no-margin--bottom" items={additionalIdpGroups} />
        </>
      }
    >
      <span
        tabIndex={0}
        className="u-text--muted"
        aria-label={`${additionalIdpGroups.length} additional identity provider ${pluralize("group", additionalIdpGroups.length)}`}
      >
        {" "}
        +{additionalIdpGroups.length}
      </span>
    </Tooltip>
  );
};

export default IdentityAdditionalIdpGroups;
