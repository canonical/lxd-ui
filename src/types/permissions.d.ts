import type { AUTH_METHOD } from "util/authentication";

export interface LxdIdentity {
  id: string; // fingerprint for tls and email for oidc
  type:
    | "Client certificate"
    | "Client certificate (pending)"
    | "Client certificate (unrestricted)"
    | "Cluster link certificate"
    | "Cluster link certificate (pending)"
    | "Metrics certificate (unrestricted)"
    | "OIDC client"
    | "Server certificate";
  name: string;
  authentication_method: typeof AUTH_METHOD.TLS | typeof AUTH_METHOD.OIDC;
  tls_certificate: string;
  groups?: string[] | null;
  effective_groups?: string[];
  effective_permissions?: LxdPermission[];
  fine_grained: boolean;
  access_entitlements?: string[];
  expires_at?: string;
}

export interface LxdAuthGroup {
  name: string;
  description: string;
  permissions?: LxdPermission[];
  identities?: {
    oidc?: string[];
    tls?: string[];
  };
  identity_provider_groups?: string[];
  access_entitlements?: string[];
}

export interface LxdPermission {
  entity_type: string;
  url: string;
  entitlement: string;
  groups?: LxdAuthGroup[];
}

export interface IdpGroup {
  name: string;
  groups: string[]; // these should be names of lxd groups
  access_entitlements?: string[];
}

export interface TlsIdentityTokenDetail {
  client_name: string;
  addresses: string[];
  expires_at: string;
  fingerprint: string;
  type: "Client certificate (pending)" | "Client certificate";
  secret: string;
}
