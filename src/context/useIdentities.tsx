import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "./auth";
import type { LxdIdentity } from "types/permissions";
import { fetchIdentities, fetchIdentity } from "api/auth-identities";

export const useIdentities = (): UseQueryResult<LxdIdentity[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.identities],
    queryFn: async () => fetchIdentities(isFineGrained),
    enabled: isFineGrained !== null,
  });
};

export const useIdentity = (
  id: string,
  authMethod: string,
  enabled?: boolean,
): UseQueryResult<LxdIdentity> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.identities, authMethod, id],
    queryFn: async () => fetchIdentity(id, authMethod, isFineGrained),
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};
