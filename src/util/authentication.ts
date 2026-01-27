// Authentication method constants
export const AUTH_METHOD = {
  TLS: "tls",
  OIDC: "oidc",
  UNIX: "unix",
  BEARER: "bearer",
} as const;

// Type derived from the constants
export type AuthMethod = (typeof AUTH_METHOD)[keyof typeof AUTH_METHOD];

export const isPermanentAuthMethod = (method?: AuthMethod): boolean => {
  return method !== null && method !== AUTH_METHOD.BEARER;
};
