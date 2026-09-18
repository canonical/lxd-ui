import type { LxdIdentity } from "types/permissions";
import type { IDENTITY_TYPE } from "util/identityTypes";

export const isRestricted = (identity: LxdIdentity) => {
  return identity.type.endsWith("(restricted)");
};

const isUnrestricted = (identity: LxdIdentity) => {
  // matches both "Client certificate (unrestricted)" and "Metrics certificate (unrestricted)"
  return (
    identity.type.endsWith("(unrestricted)") ||
    identity.type.startsWith("Server certificate")
  );
};

export const isLegacyIdentity = (identity: LxdIdentity) => {
  return isRestricted(identity) || isUnrestricted(identity);
};

export const isFineGrainedTls = (identity: LxdIdentity) => {
  return ["Client certificate (pending)", "Client certificate"].includes(
    identity.type,
  );
};

export const isSystemIdentity = (identity: LxdIdentity) => {
  return (
    identity.type.startsWith("Server certificate") ||
    identity.type.startsWith("Metrics certificate")
  );
};

export const isBearerIdentityType = (
  identityType: LxdIdentity["type"],
): identityType is
  | typeof IDENTITY_TYPE.BEARER_CLIENT
  | typeof IDENTITY_TYPE.BEARER_DEVLXD => {
  return identityType.toLowerCase().includes("token bearer");
};
