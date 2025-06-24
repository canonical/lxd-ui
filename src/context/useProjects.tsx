import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { LxdProject } from "types/project";
import { useAuth } from "./auth";
import { queryKeys } from "util/queryKeys";
import { fetchProject, fetchProjects } from "api/projects";

export const useProjects = (): UseQueryResult<LxdProject[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.projects],
    queryFn: async () => fetchProjects(isFineGrained),
    enabled: isFineGrained !== null,
  });
};

export const useProject = (
  project: string,
  enabled?: boolean,
): UseQueryResult<LxdProject> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.projects, project],
    queryFn: async () => fetchProject(project, isFineGrained),
    retry: false, // disable for users with limited permissions not going into retry loop with delay
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};
