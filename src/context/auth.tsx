import { createContext, FC, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchCertificates } from "api/certificates";
import { useSettings } from "context/useSettings";
import { fetchProjects } from "api/projects";
import { fetchCurrentIdentity } from "api/auth-identities";
import { useSupportedFeatures } from "./useSupportedFeatures";

interface ContextProps {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isOidc: boolean;
  isRestricted: boolean;
  defaultProject: string;
  hasNoProjects: boolean;
  isFineGrained: boolean | null;
}

const initialState: ContextProps = {
  isAuthenticated: false,
  isAuthLoading: true,
  isOidc: false,
  isRestricted: false,
  defaultProject: "default",
  hasNoProjects: false,
  isFineGrained: null,
};

export const AuthContext = createContext<ContextProps>(initialState);

interface ProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<ProviderProps> = ({ children }) => {
  const { data: settings, isLoading } = useSettings();

  const { hasEntitiesWithEntitlements, isSettingsLoading } =
    useSupportedFeatures();

  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: [queryKeys.projects],
    queryFn: fetchProjects,
    enabled: settings?.auth === "trusted",
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

  const { data: currentIdentity } = useQuery({
    queryKey: [queryKeys.currentIdentity],
    queryFn: fetchCurrentIdentity,
    retry: false, // avoid retry for older versions of lxd less than 5.21 due to missing endpoint
  });

  const fingerprint = isTls ? settings.auth_user_name : undefined;
  const certificate = certificates.find(
    (certificate) => certificate.fingerprint === fingerprint,
  );
  const isRestricted = certificate?.restricted ?? defaultProject !== "default";
  const isFineGrained = () => {
    if (isSettingsLoading) {
      return null;
    }
    if (hasEntitiesWithEntitlements) {
      return currentIdentity?.fine_grained ?? null;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: (settings && settings.auth !== "untrusted") ?? false,
        isOidc: settings?.auth_user_method === "oidc",
        isAuthLoading: isLoading,
        isRestricted,
        defaultProject,
        hasNoProjects: projects.length === 0 && !isProjectsLoading,
        isFineGrained: isFineGrained(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
