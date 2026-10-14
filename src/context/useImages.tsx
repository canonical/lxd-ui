import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useAuth } from "./auth";
import {
  fetchImagesInAllProjects,
  fetchLocalImagesInProject,
} from "api/images";
import type {
  LxdImage,
  LxdImageRegistry,
  RemoteImagesResult,
} from "types/image";
import { loadRemoteImagesLegacy } from "util/imageLegacy";
import {
  loadImagesFromBuiltInRegistries,
  loadImagesFromRegistry,
} from "util/imageRegistry";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useCurrentProject } from "context/useCurrentProject";

export const useLocalImagesInProject = (
  project: string,
  enabled?: boolean,
): UseQueryResult<LxdImage[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.images, project],
    queryFn: async () => fetchLocalImagesInProject(project, isFineGrained),
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};

export const useImagesInAllProjects = (
  enabled?: boolean,
): UseQueryResult<LxdImage[]> => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.images],
    queryFn: async () => fetchImagesInAllProjects(isFineGrained),
    enabled: (enabled ?? true) && isFineGrained !== null,
  });
};

// loads images from the built-in registries by default, or from a single
// registry when a registry name (or a server url for legacy servers) is passed
export const useRemoteImages = (
  registries: LxdImageRegistry[],
  registryName?: string,
  enabled = true,
): UseQueryResult<RemoteImagesResult> => {
  const { isFineGrained } = useAuth();
  const { hasImageRegistries } = useSupportedFeatures();
  const { project } = useCurrentProject();
  const registryQueriesEnabled =
    enabled &&
    hasImageRegistries &&
    isFineGrained !== null &&
    project !== undefined;

  const legacyResult = useQuery({
    queryKey: [queryKeys.images, "selector", hasImageRegistries, registryName],
    queryFn: async () => loadRemoteImagesLegacy(registryName),
    enabled: enabled && !hasImageRegistries,
  });

  const builtInResult = useQuery({
    queryKey: [
      queryKeys.images,
      "selector",
      hasImageRegistries,
      project?.name,
      "builtin",
    ],
    queryFn: async () =>
      loadImagesFromBuiltInRegistries(registries, !!isFineGrained, project),
    enabled: registryQueriesEnabled && !registryName,
  });

  const registryResult = useQuery({
    queryKey: [
      queryKeys.images,
      "selector",
      hasImageRegistries,
      project?.name,
      "registry",
      registryName,
    ],
    queryFn: async () => {
      const registry = registries.find((item) => item.name === registryName);
      if (!registry) {
        return { images: [], error: `Registry ${registryName} not found` };
      }
      return loadImagesFromRegistry(registry, !!isFineGrained, project);
    },
    enabled: registryQueriesEnabled && !!registryName,
  });

  if (!hasImageRegistries) {
    return legacyResult;
  }
  return registryName ? registryResult : builtInResult;
};
