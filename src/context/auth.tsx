import React, { createContext, FC, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { checkAuth } from "api/certificates";

interface ContextProps {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
}

const initialState: ContextProps = {
  isAuthenticated: false,
  isAuthLoading: true,
};

export const AuthContext = createContext<ContextProps>(initialState);

interface ProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<ProviderProps> = ({ children }) => {
  const { data, isLoading } = useQuery<boolean>({
    queryKey: [queryKeys.certificates],
    queryFn: checkAuth,
  });

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: data ?? false,
        isAuthLoading: isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
