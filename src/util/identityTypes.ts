export const IDENTITY_TYPE = {
  TLS: "Client certificate",
  BEARER_CLIENT: "Client token bearer",
  BEARER_DEVLXD: "DevLXD token bearer",
  CLUSTER_LINK: "Cluster link certificate",
} as const;

export type IdentityType = (typeof IDENTITY_TYPE)[keyof typeof IDENTITY_TYPE];

export type BearerIdentityType = Extract<
  IdentityType,
  typeof IDENTITY_TYPE.BEARER_CLIENT | typeof IDENTITY_TYPE.BEARER_DEVLXD
>;
