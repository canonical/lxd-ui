import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { UseQueryResult } from "@tanstack/react-query";
import { fetchInstance, fetchInstances } from "api/instances";
import { useAuth } from "./auth";
import type { LxdInstance } from "types/instance";

export const useInstances = (
  project: string | null,
): UseQueryResult<LxdInstance[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.instances, project],
    queryFn: async () => fetchInstances(project, isFineGrained),
    enabled: isFineGrained !== null,
  });
};

export const useInstance = (
  name: string,
  project: string,
  enabled?: boolean,
): UseQueryResult<LxdInstance> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.instances, name, project],
    queryFn: async () => fetchInstance(name, project, isFineGrained),
    enabled: enabled && isFineGrained !== null,
  });
};
