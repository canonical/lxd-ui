import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useAuth } from "./auth";
import {
  fetchPlacementGroup,
  fetchPlacementGroups,
} from "api/placement-groups";
import type { LxdPlacementGroup } from "types/placementGroup";

export const usePlacementGroups = (
  project?: string,
  enabled = true,
): UseQueryResult<LxdPlacementGroup[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.placementGroups, project],
    queryFn: async () => {
      if (!project) return [];
      return fetchPlacementGroups(project, isFineGrained);
    },
    enabled: !!project && enabled,
  });
};

export const usePlacementGroup = (
  group: string,
  project: string,
): UseQueryResult<LxdPlacementGroup> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.placementGroups, project, group],
    queryFn: async () => fetchPlacementGroup(group, project, isFineGrained),
  });
};
