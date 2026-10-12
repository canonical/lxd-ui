import {
  byOSRelease,
  localLxdToRemoteImage,
  sortUbuntuImages,
} from "util/images";
import type {
  LxdImageRegistry,
  RemoteImage,
  RemoteImagesResult,
} from "types/image";
import { fetchRegistryImages } from "api/image-registries";
import type { LxdProject } from "types/project";
import type { RegistryRestrictionMode } from "types/forms/project";

const REGISTRY_PREFIX = "registry:";

export const getRegistryName = (value: string): string =>
  value.slice(REGISTRY_PREFIX.length);

export const addRegistryPrefix = (registryName: string): string =>
  REGISTRY_PREFIX + registryName;

export const REGISTRY_KEYWORDS = {
  ALLOW: "allow",
  BLOCK: "block",
  BUILTIN: "builtin",
} as const;

export const getRegistryRestrictionMode = (
  value?: string,
): RegistryRestrictionMode => {
  if (!value || value === REGISTRY_KEYWORDS.BUILTIN) {
    return "builtin";
  }
  if (value === REGISTRY_KEYWORDS.ALLOW) {
    return "allow";
  }
  if (value === REGISTRY_KEYWORDS.BLOCK) {
    return "block";
  }
  return "custom";
};

export const isRegistryAllowedInProject = (
  registry: Pick<LxdImageRegistry, "name" | "builtin">,
  project?: LxdProject | null,
): boolean => {
  const isProjectRestricted =
    project?.config["restricted"] && project?.config["restricted"] !== "false";

  if (!isProjectRestricted) {
    return true;
  }

  const value = project.config["restricted.registries"];
  const mode = getRegistryRestrictionMode(value);
  if (mode === "allow") {
    return true;
  }
  if (mode === "block") {
    return false;
  }
  if (mode === "builtin") {
    return registry.builtin;
  }

  const allowed = (value ?? "").split(",").map((item) => item.trim());
  return (
    allowed.includes(registry.name) ||
    (registry.builtin && allowed.includes(REGISTRY_KEYWORDS.BUILTIN))
  );
};

const uniqueTitle = (item: RemoteImage, index: number, self: RemoteImage[]) => {
  return index === self.findIndex((t) => t.title === item.title);
};

const markVmAndContainerImagesAsOne = (item: RemoteImage) => {
  delete item.type;
  item.versions = {
    vm: {
      items: {
        "disk1.img": { ftype: "disk1.img" },
      },
    },
  };
};

// Only built-in Ubuntu registries need VM/container merging and Ubuntu sorting.
// Custom registries with Ubuntu-prefixed names and other built-ins stay unchanged.
const processRegistryImages = (
  registry: LxdImageRegistry,
  images: RemoteImage[],
): RemoteImage[] => {
  if (!registry.builtin || !registry.name.startsWith("ubuntu")) {
    return images;
  }
  const processed = images.filter(uniqueTitle);
  processed.forEach(markVmAndContainerImagesAsOne);
  return sortUbuntuImages(processed);
};

// fetch and transform images from a single registry
// the project restriction is checked before making any request
export const loadImagesFromRegistry = async (
  registry: LxdImageRegistry,
  isFineGrained: boolean,
  project?: LxdProject,
): Promise<RemoteImagesResult> => {
  if (!isRegistryAllowedInProject(registry, project)) {
    return { images: [], error: "" };
  }

  try {
    const registryImages = await fetchRegistryImages(
      registry.name,
      isFineGrained,
    );
    const images = registryImages
      .filter((image) => {
        return !(registry.builtin && image.aliases === null);
      })
      .map((image) => {
        const item = localLxdToRemoteImage(image);
        const ltsAlias = image.aliases?.find((a) => a.name === "lts");

        return {
          ...item,
          isLts: ltsAlias !== undefined,
          registryBuiltIn: registry.builtin,
          registryName: registry.name,
          server: registry.config?.url,
          title: item.os + item.release_title + item.release + item.server,
        };
      })
      .sort(byOSRelease);
    return { images: processRegistryImages(registry, images), error: "" };
  } catch (e) {
    return { images: [], error: e instanceof Error ? e.message : String(e) };
  }
};

export const loadImagesFromBuiltInRegistries = async (
  registries: LxdImageRegistry[],
  isFineGrained: boolean,
  project?: LxdProject,
): Promise<RemoteImagesResult> => {
  const allowedRegistries = registries.filter(
    (registry) =>
      registry.builtin && isRegistryAllowedInProject(registry, project),
  );

  const imageRequests = await Promise.all(
    allowedRegistries.map(async (registry) =>
      loadImagesFromRegistry(registry, isFineGrained, project),
    ),
  );

  // if any image request failed, report it with the registry name
  const imagesByRegistry: Record<string, RemoteImage[]> = {};
  const errors: string[] = [];
  imageRequests.forEach((result, index) => {
    const registryName = allowedRegistries[index].name;
    imagesByRegistry[registryName] = result.images;
    if (result.error) {
      errors.push(`${registryName}: ${result.error}`);
    }
  });

  const preferredRegistryOrder = [
    "ubuntu",
    "ubuntu-minimal",
    "images",
    "ubuntu-daily",
    "ubuntu-minimal-daily",
  ];
  const otherRegistryNames = allowedRegistries
    .map((registry) => registry.name)
    .filter((name) => !preferredRegistryOrder.includes(name));
  const images = [...preferredRegistryOrder, ...otherRegistryNames].flatMap(
    (name) => imagesByRegistry[name] ?? [],
  );

  return { images, error: errors.join(". ") };
};
