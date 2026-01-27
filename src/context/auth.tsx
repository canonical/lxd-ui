import type { FC, ReactNode } from "react";
import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchCertificates } from "api/certificates";
import { fetchProjects } from "api/projects";
import { fetchCurrentIdentity } from "api/auth-identities";
import { useSupportedFeatures } from "./useSupportedFeatures";
import { getLoginProject } from "util/loginProject";
import type { LXDAuthMethod } from "util/authentication";
import { AUTH_METHOD } from "util/authentication";

interface ContextProps {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: Error | null;
  isRestricted: boolean;
  defaultProject: string;
  hasNoProjects: boolean;
  isFineGrained: boolean | null;
  serverEntitlements: string[];
  authMethod: LXDAuthMethod | null;
  authExpiresAt: string | null;
}

const initialState: ContextProps = {
  isAuthenticated: false,
  isAuthLoading: true,
  authError: null,
  isRestricted: false,
  defaultProject: "default",
  hasNoProjects: false,
  isFineGrained: null,
  serverEntitlements: [],
  authMethod: null,
  authExpiresAt: null,
};

export const AuthContext = createContext<ContextProps>(initialState);

interface ProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<ProviderProps> = ({ children }) => {
  const {
    hasEntitiesWithEntitlements,
    isSettingsLoading,
    settings,
    settingsError,
  } = useSupportedFeatures();

  const authMethod = settings?.auth_user_method ?? null;

  const {
    data: currentIdentity,
    isLoading: isIdentityLoading,
    error: identityError,
  } = useQuery({
    queryKey: [queryKeys.currentIdentity],
    queryFn: fetchCurrentIdentity,
    retry: false, // avoid retry for older versions of lxd less than 5.21 due to missing endpoint
    enabled:
      !isSettingsLoading &&
      settings &&
      settings.auth !== "untrusted" &&
      authMethod !== AUTH_METHOD.UNIX &&
      !settingsError &&
      settings.api_extensions?.includes("access_management_tls"),
  });

  const isFineGrained = () => {
    if (isSettingsLoading) {
      return null;
    }
    if (authMethod === AUTH_METHOD.UNIX) {
      return false;
    }
    if (hasEntitiesWithEntitlements) {
      return currentIdentity?.fine_grained ?? null;
    }
    return false;
  };

  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: [queryKeys.projects],
    queryFn: async () => fetchProjects(isFineGrained()),
    enabled: settings?.auth === "trusted" && isFineGrained() !== null,
  });

  const defaultProject = getLoginProject(projects);
  const isTls = authMethod === AUTH_METHOD.TLS;

  const { data: certificates = [] } = useQuery({
    queryKey: [queryKeys.certificates, 1],
    queryFn: fetchCertificates,
    enabled: isTls,
  });

  const fingerprint = isTls ? settings?.auth_user_name : undefined;
  const certificate = certificates.find(
    (certificate) => certificate.fingerprint === fingerprint,
  );
  const isRestricted =
    isFineGrained() !== true &&
    (certificate?.restricted ?? defaultProject !== "default");

  const serverEntitlements = (currentIdentity?.effective_permissions || [])
    .filter((permission) => permission.entity_type === "server")
    .map((permission) => permission.entitlement);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: (settings && settings.auth !== "untrusted") ?? false,
        isAuthLoading:
          isSettingsLoading || isIdentityLoading || isProjectsLoading,
        authError: settingsError ?? identityError,
        isRestricted,
        defaultProject,
        hasNoProjects: projects.length === 0 && !isProjectsLoading,
        isFineGrained: isFineGrained(),
        serverEntitlements,
        authMethod,
        authExpiresAt: currentIdentity?.expires_at ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
