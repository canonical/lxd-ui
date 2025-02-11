import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { fetchImageList } from "api/images";
import type { LxdImage } from "types/image";

export const useImages = (
  project?: string,
  enabled?: boolean,
): UseQueryResult<LxdImage[]> => {
  const { isFineGrained } = useAuth();
  const keys = [queryKeys.images];
  if (project) {
    keys.push(project);
  }
  return useQuery({
    queryKey: keys,
    queryFn: () => fetchImageList(isFineGrained, project),
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};
