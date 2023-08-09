import React, { createContext, FC, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchCertificates } from "api/certificates";
import { useSettings } from "context/useSettings";

interface ContextProps {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isRestricted: boolean;
  defaultProject: string;
}

const initialState: ContextProps = {
  isAuthenticated: false,
  isAuthLoading: true,
  isRestricted: false,
  defaultProject: "default",
};

export const AuthContext = createContext<ContextProps>(initialState);

interface ProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<ProviderProps> = ({ children }) => {
  const { data: settings, isLoading } = useSettings();

  const isTls = settings?.auth_user_method === "tls";

  const { data: certificates = [] } = useQuery({
    queryKey: [queryKeys.certificates, 1],
    queryFn: fetchCertificates,
    enabled: isTls,
  });

  const fingerprint = isTls ? settings.auth_user_name : undefined;
  const certificate = certificates.find(
    (certificate) => certificate.fingerprint === fingerprint
  );
  const isRestricted = certificate?.restricted ?? false;
  const defaultProject =
    isRestricted &&
    certificate &&
    !certificate.projects.find((p) => p === "default")
      ? certificate.projects[0]
      : "default";

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: (settings && settings.auth !== "untrusted") ?? false,
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
