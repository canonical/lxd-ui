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

// fetching directly from hard coded indexes and servers
export const loadRemoteImagesLegacy = async (): Promise<RemoteImagesResult> => {
  const canonicalImages = await loadImageJson(canonicalJson, canonicalServer);
  const minimalImages = await loadImageJson(minimalJson, minimalServer);
  const imagesLxdImages = await loadImageJson(imagesLxdJson, imagesLxdServer);

  const images = [...canonicalImages.images]
    .reverse()
    .sort(byLtsFirst)
    .concat([...minimalImages.images].reverse().sort(byLtsFirst))
    .concat([...imagesLxdImages.images]);

  const errors = [
    canonicalImages.error,
    minimalImages.error,
    imagesLxdImages.error,
  ].filter((e) => e !== "");

  return { images, error: errors.join(". ") };
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
