import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "./auth";
import type { LxdProfile } from "types/profile";
import { fetchProfile, fetchProfiles } from "api/profiles";

export const useProfiles = (project: string): UseQueryResult<LxdProfile[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.profiles, project],
    queryFn: () => fetchProfiles(project, isFineGrained),
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
    queryFn: () => fetchProfile(profile, project, isFineGrained),
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};
