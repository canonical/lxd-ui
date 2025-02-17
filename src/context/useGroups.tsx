import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { LxdGroup } from "types/permissions";
import { fetchGroups } from "api/auth-groups";

export const useGroups = (): UseQueryResult<LxdGroup[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.authGroups],
    queryFn: () => fetchGroups(isFineGrained),
    enabled: isFineGrained !== null,
  });
};
