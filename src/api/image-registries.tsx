import { handleResponse } from "util/helpers";
import type { LxdImageRegistry } from "types/image";
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
