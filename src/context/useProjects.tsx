import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { LxdProject } from "types/project";
import { useAuth } from "./auth";
import { queryKeys } from "util/queryKeys";
import { fetchProject, fetchProjects } from "api/projects";
import { useSupportedFeatures } from "context/useSupportedFeatures";

export const useProjects = (): UseQueryResult<LxdProject[]> => {
  const { isFineGrained } = useAuth();
  const { hasReplicators } = useSupportedFeatures();
  return useQuery({
    queryKey: [queryKeys.projects],
    queryFn: async () => fetchProjects(isFineGrained, hasReplicators),
    enabled: isFineGrained !== null,
  });
};

export const useProject = (
  project: string,
  enabled?: boolean,
): UseQueryResult<LxdProject> => {
  const { isFineGrained } = useAuth();
  const { hasReplicators } = useSupportedFeatures();
  return useQuery({
    queryKey: [queryKeys.projects, project],
    queryFn: async () => fetchProject(project, isFineGrained, hasReplicators),
    retry: false, // disable for users with limited permissions not going into retry loop with delay
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};
