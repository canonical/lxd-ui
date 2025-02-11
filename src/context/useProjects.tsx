import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { LxdProject } from "types/project";
import { useAuth } from "./auth";
import { queryKeys } from "util/queryKeys";
import { fetchProject, fetchProjects } from "api/projects";

export const useProjects = (): UseQueryResult<LxdProject[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.projects],
    queryFn: () => fetchProjects(isFineGrained),
    enabled: isFineGrained !== null,
  });
};

export const useProjectFetch = (
  project: string,
  enabled?: boolean,
  retry?: boolean,
): UseQueryResult<LxdProject> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.projects, project],
    queryFn: () => fetchProject(project, isFineGrained),
    retry: retry ?? true,
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};
