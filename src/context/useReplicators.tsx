import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useAuth } from "context/auth";
import { fetchReplicators, fetchReplicator } from "api/replicators";

export const useReplicators = (
  project: string | null = null,
  isEnabled = true,
) => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.projects, project, queryKeys.replicators],
    queryFn: async () => fetchReplicators(project, isFineGrained),
    enabled: isEnabled && isFineGrained !== null,
  });
};

export const useReplicator = (
  name: string,
  project: string,
  isEnabled = true,
) => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.projects, project, queryKeys.replicators, name],
    queryFn: async () => fetchReplicator(name, project, isFineGrained),
    enabled: isEnabled && isFineGrained !== null,
  });
};
