import type { IdentityType } from "util/permissionIdentities";

export interface IdentityFormValues {
  name: string;
  groups?: string[];
  identityType: IdentityType;
  expiry?: string;
}
