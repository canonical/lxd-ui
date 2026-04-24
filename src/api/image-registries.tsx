import { handleResponse } from "util/helpers";
import type { LxdImage, LxdImageRegistry } from "types/image";
import type { LxdApiResponse } from "types/apiResponse";
import { addEntitlements } from "util/entitlements/api";
import { ROOT_PATH } from "util/rootPath";

const imageRegistryEntitlements = ["can_edit", "can_delete"];

export const fetchImageRegistries = async (
  isFineGrained: boolean | null,
): Promise<LxdImageRegistry[]> => {
  const params = new URLSearchParams();
  params.set("recursion", "1");
  addEntitlements(params, isFineGrained, imageRegistryEntitlements);
  return fetch(`${ROOT_PATH}/1.0/image-registries?${params.toString()}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdImageRegistry[]>) => {
      return data.metadata;
    });
};

export const fetchImageRegistry = async (
  name: string,
  isFineGrained: boolean | null,
): Promise<LxdImageRegistry> => {
  const params = new URLSearchParams();
  params.set("recursion", "1");
  addEntitlements(params, isFineGrained, imageRegistryEntitlements);
  return fetch(
    `${ROOT_PATH}/1.0/image-registries/${encodeURIComponent(name)}?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdImageRegistry>) => {
      return data.metadata;
    });
};

export const fetchRegistryImages = async (
  name: string,
  isFineGrained: boolean | null,
): Promise<LxdImage[]> => {
  const params = new URLSearchParams();
  params.set("recursion", "1");
  addEntitlements(params, isFineGrained, imageRegistryEntitlements);
  return fetch(
    `${ROOT_PATH}/1.0/image-registries/${encodeURIComponent(name)}/images?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdImage[]>) => {
      return data.metadata;
    });
};

export const createImageRegistry = async (body: string): Promise<void> => {
  await fetch(`${ROOT_PATH}/1.0/image-registries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  }).then(handleResponse);
};

export const updateImageRegistry = async (
  name: string,
  body: string,
): Promise<void> => {
  await fetch(`${ROOT_PATH}/1.0/image-registries/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  }).then(handleResponse);
};
