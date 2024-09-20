import { useSettings } from "./useSettings";

export const useSupportedFeatures = () => {
  const { data: settings, isLoading, error } = useSettings();
  const apiExtensions = new Set(settings?.api_extensions);

  const serverVersion = settings?.environment?.server_version;
  const serverMajor = parseInt(serverVersion?.split(".")[0] ?? "0");
  const serverMinor = parseInt(serverVersion?.split(".")[1] ?? "0");

  return {
    settings,
    isSettingsLoading: isLoading,
    settingsError: error,
    hasCustomVolumeIso: apiExtensions.has("custom_volume_iso"),
    hasProjectsNetworksZones: apiExtensions.has("projects_networks_zones"),
    hasStorageBuckets: apiExtensions.has("storage_buckets"),
    hasMetadataConfiguration: apiExtensions.has("metadata_configuration"),
    hasStorageVolumesAll: apiExtensions.has("storage_volumes_all"),
    hasLocalDocumentation:
      (!!serverVersion && serverMajor >= 5 && serverMinor >= 19) ||
      serverMajor > 5,
    hasDocumentationObject:
      (!!serverVersion && serverMajor >= 5 && serverMinor >= 20) ||
      serverMajor > 5,
    hasAccessManagement: apiExtensions.has("access_management"),
    hasExplicitTrustToken: apiExtensions.has("explicit_trust_token"),
    hasInstanceCreateStart: apiExtensions.has("instance_create_start"),
    hasInstanceImportConversion: apiExtensions.has(
      "instance_import_conversion",
    ),
  };
};
