import type { FC } from "react";
import type { LxdIdentity } from "types/permissions";
import ResourceLabel from "./ResourceLabel";

interface Props {
  identity: LxdIdentity;
  truncate?: boolean;
}

const IdentityResource: FC<Props> = ({ identity, truncate }) => {
  const identityIconType =
    identity.authentication_method == "tls" ? "certificate" : "oidc-identity";

  return (
    <ResourceLabel
      type={identityIconType}
      value={identity.type}
      truncate={truncate}
    />
  );
};
export default IdentityResource;
