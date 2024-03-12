export interface LxdIdentity {
  id: string; // fingerprint for tls and email for oidc
  type: string;
  name: string;
  authentication_method: "tls" | "oidc";
  groups?: string[] | null;
  effective_groups?: string[];
  effective_permissions?: LxdPermission[];
}

export interface LxdGroup {
  name: string;
  description: string;
  permissions?: LxdPermission[];
  identities?: {
    oidc?: string[];
    tls?: string[];
  };
  identity_provider_groups?: string[];
}

export interface LxdPermission {
  entity_type: string;
  url: string;
  entitlement: string;
  groups?: LxdGroup[];
}

export interface IdpGroup {
  name: string;
  groups: string[]; // these should be names of lxd groups
}
