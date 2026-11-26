import {
  useQueries,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useAuth } from "./auth";
import type { LxdProfile } from "types/profile";
import { fetchProfile, fetchProfiles } from "api/profiles";

export const useProfiles = (project: string): UseQueryResult<LxdProfile[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.profiles, project],
    queryFn: async () => fetchProfiles(project, isFineGrained),
    enabled: !!project && isFineGrained !== null,
  });
};

export const useProfile = (
  profile: string,
  project: string,
  enabled?: boolean,
): UseQueryResult<LxdProfile> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.profiles, profile, queryKeys.projects, project],
    queryFn: async () => fetchProfile(profile, project, isFineGrained),
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};

// All profiles of each project, sharing the cache with useProfiles
export const useProjectsProfiles = (
  projects: string[],
): UseQueryResult<LxdProfile[]>[] => {
  const { isFineGrained } = useAuth();
  return useQueries({
    queries: projects.map((project) => ({
      queryKey: [queryKeys.profiles, project],
      queryFn: async () => fetchProfiles(project, isFineGrained),
      enabled: isFineGrained !== null,
    })),
  });
};
