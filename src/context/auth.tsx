import { createContext, FC, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchCertificates } from "api/certificates";
import { useSettings } from "context/useSettings";
import { fetchProjects } from "api/projects";

interface ContextProps {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isOidc: boolean;
  isRestricted: boolean;
  defaultProject: string;
}

const initialState: ContextProps = {
  isAuthenticated: false,
  isAuthLoading: true,
  isOidc: false,
  isRestricted: false,
  defaultProject: "default",
};

export const AuthContext = createContext<ContextProps>(initialState);

interface ProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<ProviderProps> = ({ children }) => {
  const { data: settings, isLoading } = useSettings();

  const { data: projects = [] } = useQuery({
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

  const fingerprint = isTls ? settings.auth_user_name : undefined;
  const certificate = certificates.find(
    (certificate) => certificate.fingerprint === fingerprint,
  );
  const isRestricted = certificate?.restricted ?? defaultProject !== "default";

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: (settings && settings.auth !== "untrusted") ?? false,
        isOidc: settings?.auth_user_method === "oidc",
        isAuthLoading: isLoading,
        isRestricted,
        defaultProject,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
