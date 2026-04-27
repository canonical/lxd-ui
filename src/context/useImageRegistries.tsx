import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useAuth } from "./auth";
import {
  fetchImageRegistries,
  fetchImageRegistry,
  fetchRegistryImages,
} from "api/image-registries";

export const useImageRegistries = (isEnabled = true) => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.imageRegistries],
    queryFn: async () => fetchImageRegistries(isFineGrained),
    enabled: isEnabled && isFineGrained !== null,
  });
};

export const useImageRegistry = (name: string, isEnabled = true) => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.imageRegistries, name],
    queryFn: async () => fetchImageRegistry(name, isFineGrained),
    enabled: isEnabled && isFineGrained !== null,
  });
};

export const useRegistryImages = (imageRegistryName: string) => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.imageRegistries, imageRegistryName, "images"],
    queryFn: async () => fetchRegistryImages(imageRegistryName, isFineGrained),
    enabled: isFineGrained !== null,
  });
};
