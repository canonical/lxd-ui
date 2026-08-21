import { useSettings } from "./useSettings";

export const useSupportedFeatures = () => {
  const { data: settings, isLoading, error } = useSettings();
  const apiExtensions = new Set(settings?.api_extensions);

  return {
    settings,
    isSettingsLoading: isLoading,
    settingsError: error,
    hasImageRegistries: apiExtensions.has("image_registries"),
    hasLoadBalancerHealthChecks: apiExtensions.has(
      "network_load_balancer_pool_health_checks",
    ),
    hasStorageDriverPowerstoreNvme: apiExtensions.has(
      "storage_driver_powerstore_nvme",
    ),
  };
};
