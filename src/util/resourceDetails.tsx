import type { LxdImage } from "types/image";

export interface ResourceDetail {
  project?: string;
  target?: string;
  pool?: string;
  instance?: string;
  volume?: string;
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
  | "volume";

// refer to api spec to see how the names can be extracted from resource url
// https://documentation.ubuntu.com/lxd/en/latest/api/
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

  if (resourceType === "storage_volume") {
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
