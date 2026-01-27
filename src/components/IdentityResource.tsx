import type { FC } from "react";
import type { LxdIdentity } from "types/permissions";
import ResourceLabel from "./ResourceLabel";
import { AUTH_METHOD } from "util/authentication";

interface Props {
  identity: LxdIdentity;
  truncate?: boolean;
  bold?: boolean;
}

const IdentityResource: FC<Props> = ({ identity, truncate, bold }) => {
  const identityIconType =
    identity.authentication_method == AUTH_METHOD.TLS
      ? "certificate"
      : "oidc-identity";

  return (
    <ResourceLabel
      type={identityIconType}
      value={identity.type}
      truncate={truncate}
      bold={bold}
    />
  );
};
export default IdentityResource;
