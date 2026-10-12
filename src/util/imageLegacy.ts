import type {
  RemoteImage,
  RemoteImageList,
  RemoteImagesResult,
} from "types/image";
import { capitalizeFirstLetter, handleResponse } from "util/helpers";
import { byLtsFirst } from "util/images";

const canonicalJson =
  "https://cloud-images.ubuntu.com/releases/streams/v1/com.ubuntu.cloud:released:download.json";
export const canonicalServer = "https://cloud-images.ubuntu.com/releases";

const minimalJson =
  "https://cloud-images.ubuntu.com/minimal/releases/streams/v1/com.ubuntu.cloud:released:download.json";
export const minimalServer =
  "https://cloud-images.ubuntu.com/minimal/releases/";

const imagesLxdJson = "https://images.lxd.canonical.com/streams/v1/images.json";
export const imagesLxdServer = "https://images.lxd.canonical.com";

interface LegacyImageSource {
  label: string;
  server: string;
  json: string;
  sortLtsFirst: boolean;
}

export const legacyImageSources: LegacyImageSource[] = [
  {
    label: "Ubuntu",
    server: canonicalServer,
    json: canonicalJson,
    sortLtsFirst: true,
  },
  {
    label: "Ubuntu Minimal",
    server: minimalServer,
    json: minimalJson,
    sortLtsFirst: true,
  },
  {
    label: "LXD Images",
    server: imagesLxdServer,
    json: imagesLxdJson,
    sortLtsFirst: false,
  },
];

// fetching directly from hard coded indexes and servers
// when a server is passed, only images from that source are loaded
export const loadRemoteImagesLegacy = async (
  server?: string,
): Promise<RemoteImagesResult> => {
  const sources = server
    ? legacyImageSources.filter((source) => source.server === server)
    : legacyImageSources;

  const results = await Promise.all(
    sources.map(async (source) => {
      const result = await loadImageJson(source.json, source.server);
      const images = source.sortLtsFirst
        ? [...result.images].reverse().sort(byLtsFirst)
        : result.images;
      return { images, error: result.error };
    }),
  );

  const errors = results
    .map((result) => result.error)
    .filter((error) => error !== "");

  return {
    images: results.flatMap((result) => result.images),
    error: errors.join(". "),
  };
};

const loadImageJson = async (
  file: string,
  server: string,
): Promise<RemoteImagesResult> => {
  return new Promise((resolve) => {
    fetch(file)
      .then(handleResponse)
      .then((data: RemoteImageList) => {
        const images: RemoteImage[] = Object.entries(data.products).map(
          (product) => {
            const { os, ...image } = product[1];
            const formattedOs = capitalizeFirstLetter(os);
            return { ...image, os: formattedOs, server: server };
          },
        );
        resolve({ images, error: "" });
      })
      .catch((e: Error) => {
        resolve({ images: [], error: e.message });
      });
  });
};
