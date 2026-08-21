import type { LxdImage } from "types/image";
import { pluralize } from "./helpers";

export interface ResourceDetail {
  project?: string;
  target?: string;
  pool?: string;
  instance?: string;
  volume?: string;
  network?: string;
  description?: string;
  imageType?: string;
  fingerprint?: string;
  aliases?: string[];
  path: string;
  name: string;
  type: string;
}

export type ResourceType =
  | "instance"
  | "profile"
  | "snapshot"
  | "image"
  | "network"
  | "network-forward"
  | "bucket"
  | "replicator"
  | "volume";

// refer to api spec to see how the names can be extracted from resource url
// https://canonical.com/lxd/docs/latest/api/
export const extractResourceDetailsFromUrl = (
  resourceType: string,
  path: string,
  imageLookup?: Record<string, Partial<LxdImage>>,
  identityNamesLookup?: Record<string, string>,
): ResourceDetail => {
  const url = new URL(`http://localhost/${path}`);
  const project = url.searchParams.get("project");
  const target = url.searchParams.get("target");
  const urlSegments = url.pathname.split("/");
  const name = decodeURIComponent(urlSegments[urlSegments.length - 1]);
  const resourceName =
    (identityNamesLookup ?? {})[name] ||
    (imageLookup ?? {})[name]?.name ||
    name;

  const resourceDetail: ResourceDetail = {
    project: project ? project : undefined,
    target: target ? target : undefined,
    // calling decode twice because the result is double encoded
    // see https://github.com/canonical/lxd/issues/12398
    name: decodeURIComponent(resourceName),
    path,
    type: resourceType,
  };

  if (resourceType === "server") {
    resourceDetail.name = "server";
  }

  // permission selectors fetch their options from the metadata api, which uses "storage_volume"
  // ui internal resourceType from the ResourceIconType is slightly simpler "volume"
  if (resourceType === "storage_volume" || resourceType === "volume") {
    resourceDetail.pool = urlSegments[4];
  }

  if (resourceType === "snapshot") {
    if (path.includes("1.0/instances")) {
      resourceDetail.instance = urlSegments[4];
    }

    if (path.includes("1.0/storage-pools")) {
      resourceDetail.pool = urlSegments[4];
      resourceDetail.volume = urlSegments[7];
    }
  }

  if (resourceType === "network-forward") {
    resourceDetail.network = urlSegments[4];
  }

  // storage volumes could be related to images, so we check if a match can be found based on fingerprint
  const isImageRelatedResource =
    path.includes("images") || (imageLookup && name in imageLookup);

  if (isImageRelatedResource) {
    const image = imageLookup?.[name];
    resourceDetail.description = image?.properties?.description;
    resourceDetail.fingerprint = (image?.fingerprint || name).slice(0, 6);
    resourceDetail.imageType = image?.type;
    resourceDetail.aliases = image?.aliases?.map((alias) => alias.name);
  }

  return resourceDetail;
};

export const formatCoreCount = (cores: number): string => {
  if (cores === 0) return "0";
  // If it's a whole number, don't show decimals (e.g. 2 instead of 2.0)
  if (cores % 1 === 0) return cores.toString();
  // Otherwise format to 1 decimal place
  return cores.toFixed(1);
};

export const getCpuText = ({
  total,
  percentage,
}: {
  total: number;
  percentage: number;
}): string => {
  return `${percentage.toFixed(1)}% of ${formatCoreCount(total)} ${pluralize("core", total)}`;
};
