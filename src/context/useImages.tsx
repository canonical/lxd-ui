import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { fetchImagesInAllProjects, fetchImagesInProject } from "api/images";
import type { LxdImage } from "types/image";

export const useImagesInProject = (
  project: string,
  enabled?: boolean,
): UseQueryResult<LxdImage[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.images, project],
    queryFn: () => fetchImagesInProject(project, isFineGrained),
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};

export const useImagesInAllProjects = (
  enabled?: boolean,
): UseQueryResult<LxdImage[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.images],
    queryFn: () => fetchImagesInAllProjects(isFineGrained),
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};
