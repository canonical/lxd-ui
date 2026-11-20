import {
  useQueries,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useAuth } from "./auth";
import type { LxdProfile } from "types/profile";
import { fetchProfile, fetchProfiles } from "api/profiles";
import type { LxdUsedBy } from "util/usedBy";

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

export const useUsedByProfiles = (
  profiles: LxdUsedBy[],
): UseQueryResult<LxdProfile>[] => {
  const { isFineGrained } = useAuth();
  return useQueries({
    queries: profiles.map((profile) => ({
      queryKey: [
        queryKeys.profiles,
        profile.name,
        queryKeys.projects,
        profile.project,
      ],
      queryFn: async () =>
        fetchProfile(profile.name, profile.project, isFineGrained),
      enabled: isFineGrained !== null,
    })),
  });
};
