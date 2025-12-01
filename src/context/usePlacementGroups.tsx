import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "./auth";
import {
  fetchPlacementGroup,
  fetchPlacementGroups,
} from "api/placement-groups";
import type { LxdPlacementGroup } from "types/placementGroup";

export const usePlacementGroups = (
  project: string,
): UseQueryResult<LxdPlacementGroup[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.placementGroups, project],
    queryFn: async () => fetchPlacementGroups(project, isFineGrained),
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
