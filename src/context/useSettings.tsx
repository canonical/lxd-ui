import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchSettings } from "api/server";
import { LxdSettings } from "types/server";
import { UseQueryResult } from "@tanstack/react-query/src/types";

export const useSettings = (): UseQueryResult<LxdSettings> => {
  return useQuery({
    queryKey: [queryKeys.settings],
    queryFn: fetchSettings,
  });
};
