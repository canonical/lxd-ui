import { queryKeys } from "util/queryKeys";
import { useAuth } from "./auth";
import { useSupportedFeatures } from "./useSupportedFeatures";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { RemoteImage } from "types/image";
import { loadIsoVolumes, loadVolumes } from "./loadIsoVolumes";
import { loadCustomVolumes } from "./loadCustomVolumes";
import type { LxdStorageVolume } from "types/storage";
import { fetchStorageVolume } from "api/storage-volumes";

export const useLoadVolumes = (
  project: string,
): UseQueryResult<LxdStorageVolume[]> => {
  const { isFineGrained } = useAuth();
  const { hasStorageVolumesAll } = useSupportedFeatures();
  return useQuery({
    queryKey: [queryKeys.volumes, project],
    queryFn: async () =>
      loadVolumes(project, hasStorageVolumesAll, isFineGrained),
  });
};

export const useLoadIsoVolumes = (
  project: string,
): UseQueryResult<RemoteImage[]> => {
  const { isFineGrained } = useAuth();
  const { hasStorageVolumesAll } = useSupportedFeatures();
  return useQuery({
    queryKey: [queryKeys.isoVolumes, project],
    queryFn: async () =>
      loadIsoVolumes(project, hasStorageVolumesAll, isFineGrained),
  });
};

export const useLoadCustomVolumes = (
  project: string,
  options?: Partial<UseQueryOptions<LxdStorageVolume[]>>,
): UseQueryResult<LxdStorageVolume[]> => {
  const { isFineGrained } = useAuth();
  const { hasStorageVolumesAll } = useSupportedFeatures();
  return useQuery({
    queryKey: [queryKeys.customVolumes, project],
    queryFn: async () =>
      loadCustomVolumes(project, hasStorageVolumesAll, isFineGrained),
    ...options,
  });
};

export const useStorageVolume = (
  pool: string,
  project: string,
  type: string,
  volume: string,
  target?: string,
): UseQueryResult<LxdStorageVolume> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.storage, pool, project, type, volume, target],
    queryFn: async () =>
      fetchStorageVolume(
        pool,
        project,
        type,
        volume,
        target ?? null,
        isFineGrained,
      ),
  });
};
