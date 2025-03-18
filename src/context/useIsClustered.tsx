import { useSettings } from "context/useSettings";
import { isClusteredServer } from "util/settings";

export const useIsClustered = (): boolean => {
  const { data: settings } = useSettings();
  return isClusteredServer(settings);
};
