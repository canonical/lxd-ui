import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "./auth";
import type { IdpGroup } from "types/permissions";
import { fetchIdpGroups } from "api/auth-idp-groups";

export const useIdpGroups = (): UseQueryResult<IdpGroup[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.idpGroups],
    queryFn: () => fetchIdpGroups(isFineGrained),
    enabled: isFineGrained !== null,
  });
};
