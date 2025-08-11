import type { FC, ReactNode } from "react";
import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchCertificates } from "api/certificates";
import { fetchProjects } from "api/projects";
import { fetchCurrentIdentity } from "api/auth-identities";
import { useSupportedFeatures } from "./useSupportedFeatures";

interface ContextProps {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: Error | null;
  isOidc: boolean;
  isRestricted: boolean;
  defaultProject: string;
  hasNoProjects: boolean;
  isFineGrained: boolean | null;
  serverEntitlements: string[];
}

const initialState: ContextProps = {
  isAuthenticated: false,
  isAuthLoading: true,
  authError: null,
  isOidc: false,
  isRestricted: false,
  defaultProject: "default",
  hasNoProjects: false,
  isFineGrained: null,
  serverEntitlements: [],
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
      !settingsError &&
      settings.api_extensions?.includes("access_management_tls"),
  });

  const isFineGrained = () => {
    if (isSettingsLoading) {
      return null;
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

  const defaultProject =
    projects.length < 1 || projects.find((p) => p.name === "default")
      ? "default"
      : projects[0].name;

  const isTls = settings?.auth_user_method === "tls";

  const { data: certificates = [] } = useQuery({
    queryKey: [queryKeys.certificates, 1],
    queryFn: fetchCertificates,
    enabled: isTls,
  });

  const fingerprint = isTls ? settings.auth_user_name : undefined;
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
        isAuthenticated: false, //(settings && settings.auth !== "untrusted") ?? false,
        isOidc: settings?.auth_user_method === "oidc",
        isAuthLoading:
          isSettingsLoading || isIdentityLoading || isProjectsLoading,
        authError: settingsError ?? identityError,
        isRestricted,
        defaultProject,
        hasNoProjects: projects.length === 0 && !isProjectsLoading,
        isFineGrained: isFineGrained(),
        serverEntitlements,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
