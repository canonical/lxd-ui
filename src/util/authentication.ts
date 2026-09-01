import type { IconName } from "@canonical/ds-assets";

// Authentication method constants
export const AUTH_METHOD = {
  TLS: "tls",
  OIDC: "oidc",
  UNIX: "unix",
  BEARER: "bearer",
} as const;

// Type derived from the constants
export type LXDAuthMethod = (typeof AUTH_METHOD)[keyof typeof AUTH_METHOD];

export const isPermanent = (method?: LXDAuthMethod | null): boolean => {
  return !!method && method !== AUTH_METHOD.BEARER;
};

export const authIcon = (authMethod?: LXDAuthMethod | null): IconName | "" => {
  switch (authMethod) {
    case AUTH_METHOD.TLS:
      return "locked";
    case AUTH_METHOD.OIDC:
    case AUTH_METHOD.UNIX:
      return "user-profile";
    case AUTH_METHOD.BEARER:
      return "private-key";
    default:
      return "";
  }
};
