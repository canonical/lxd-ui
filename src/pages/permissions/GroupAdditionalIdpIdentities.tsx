import { List, Tooltip } from "@canonical/react-components";
import { type FC } from "react";
import type { LxdAuthGroup } from "types/permissions";
import { pluralize } from "util/helpers";
import { useIdentities } from "context/useIdentities";

interface Props {
  group: LxdAuthGroup;
}

const GroupAdditionalIdpIdentities: FC<Props> = ({ group }) => {
  const { data: identities = [] } = useIdentities();

  const groupIdentities = new Set(group.identities?.oidc ?? []);
  const additionalIdentities = identities
    .filter((identity) => {
      if (identity.authentication_method !== "oidc") {
        return false;
      }
      if (groupIdentities.has(identity.name)) {
        return false;
      }
      return identity.effective_groups?.includes(group.name);
    })
    .map((identity) => identity.name);

  if (additionalIdentities.length === 0) {
    return null;
  }

  return (
    <Tooltip
      className="u-margin-left--small"
      message={
        <>
          Additional identities from Identity provider group mappings:
          <List className="u-no-margin--bottom" items={additionalIdentities} />
        </>
      }
    >
      <span
        tabIndex={0}
        className="u-text--muted"
        aria-label={`${additionalIdentities.length} additional ${pluralize("identity", additionalIdentities.length)} through identity provider group mappings`}
      >
        {" "}
        +{additionalIdentities.length}
      </span>
    </Tooltip>
  );
};

export default GroupAdditionalIdpIdentities;
