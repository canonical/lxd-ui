import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { LxdIdentity } from "types/permissions";
import { fetchIdentities, fetchIdentity } from "api/auth-identities";

export const useIdentities = (): UseQueryResult<LxdIdentity[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.identities],
    queryFn: () => fetchIdentities(isFineGrained),
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
    queryKey: [queryKeys.identities, id],
    queryFn: () => fetchIdentity(id, authMethod, isFineGrained),
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};
