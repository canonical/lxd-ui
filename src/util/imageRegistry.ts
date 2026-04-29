import { byLtsFirst, byOSRelease, localLxdToRemoteImage } from "util/images";
import type {
  LxdImageRegistry,
  RemoteImage,
  RemoteImagesResult,
} from "types/image";
import {
  fetchImageRegistries,
  fetchRegistryImages,
} from "api/image-registries";
import type { LxdProject } from "types/project";

// fetch image registries and images from all configured registries
export const loadImagesFromAllRegistries = async (
  isFineGrained: boolean,
  project?: LxdProject,
): Promise<RemoteImagesResult> => {
  const registries = await fetchImageRegistries(isFineGrained);

  const isAllowedRegistry = (registry: LxdImageRegistry): boolean => {
    const isProjectRestricted = project?.config["restricted"];
    if (!isProjectRestricted) {
      return true;
    }

    const allowedRegistries =
      project?.config["restricted.registries"]?.split(",") ?? [];
    return allowedRegistries.includes(registry.name);
  };

  const imagesByRegistry: Record<string, RemoteImage[]> = {};
  const imageRequests = await Promise.allSettled(
    registries.filter(isAllowedRegistry).map(async (registry) => {
      const registryImages = await fetchRegistryImages(
        registry.name,
        isFineGrained,
      );

      imagesByRegistry[registry.name] = registryImages
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
    }),
  );

  // if any image request failed, throw
  const errors: string[] = [];
  imageRequests.forEach((res) => {
    if (res.status !== "fulfilled") {
      errors.push(res.reason as string);
    }
  });

  const uniqueTitle = (
    item: RemoteImage,
    index: number,
    self: RemoteImage[],
  ) => {
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

  const ubuntuRegistries = [
    "ubuntu",
    "ubuntu-minimal",
    "ubuntu-daily",
    "ubuntu-minimal-daily",
  ];

  ubuntuRegistries.forEach((name) => {
    const images = name in imagesByRegistry ? imagesByRegistry[name] : [];
    imagesByRegistry[name] = images.filter(uniqueTitle);
    imagesByRegistry[name].map(markVmAndContainerImagesAsOne);
    imagesByRegistry[name].reverse().sort(byLtsFirst);
  });

  // order for builtin registries
  const images: RemoteImage[] = [
    ...imagesByRegistry["ubuntu"],
    ...imagesByRegistry["ubuntu-minimal"],
    ...("images" in imagesByRegistry ? imagesByRegistry["images"] : []),
    ...imagesByRegistry["ubuntu-daily"],
    ...imagesByRegistry["ubuntu-minimal-daily"],
  ];

  // add images from custom registries
  Object.entries(imagesByRegistry).forEach(([registry, registryImages]) => {
    if (!ubuntuRegistries.includes(registry) && registry !== "images") {
      images.push(...registryImages);
    }
  });

  return { images, error: errors.join(". ") };
};
