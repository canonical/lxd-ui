import type { FC } from "react";
import ResourceLabel from "components/ResourceLabel";
import ResourceLink from "components/ResourceLink";
import type { LxdIdentity } from "types/permissions";
import { getIdentityIconType } from "util/permissionIdentities";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  identity: LxdIdentity;
  variant?: "link" | "label";
}

const IdentityResource: FC<Props> = ({ identity, variant = "link" }) => {
  const name = identity.name?.trim();
  const label = name
    ? `${name} (${identity.type}, ${identity.id})`
    : `${identity.id} (${identity.type})`;

  if (variant === "label") {
    return (
      <ResourceLabel
        type={getIdentityIconType(identity.type)}
        value={label}
        bold
        truncate
      />
    );
  }

  return (
    <ResourceLink
      type={getIdentityIconType(identity.type)}
      value={label}
      to={`${ROOT_PATH}/ui/permissions/identities`}
    />
  );
};
export default IdentityResource;
