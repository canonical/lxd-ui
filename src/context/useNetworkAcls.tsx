import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "./auth";
import type { LxdNetworkAcl } from "types/network";
import { fetchNetworkAcl, fetchNetworkAcls } from "api/network-acls";

export const useNetworkAcls = (
  project: string,
  enabled?: boolean,
): UseQueryResult<LxdNetworkAcl[]> => {
  const { isFineGrained } = useAuth();

  return useQuery({
    queryKey: [queryKeys.projects, project, queryKeys.networkAcls],
    queryFn: async () => fetchNetworkAcls(project, isFineGrained),
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};

export const useNetworkAcl = (
  name: string,
  project: string,
  enabled?: boolean,
): UseQueryResult<LxdNetworkAcl> => {
  const { isFineGrained } = useAuth();

  return useQuery({
    queryKey: [queryKeys.projects, project, queryKeys.networkAcls, name],
    queryFn: async () => fetchNetworkAcl(name, project, isFineGrained),
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};
