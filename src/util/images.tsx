import type { LxdImage, RemoteImage } from "types/image";
import type { LxdStorageVolume } from "types/storage";
import { capitalizeFirstLetter } from "./helpers";

export const isVmOnlyImage = (image: RemoteImage): boolean | undefined => {
  if (image.server === LOCAL_ISO || image.type === "virtual-machine") {
    return true;
  }
  return image.variant?.includes("desktop");
};

export const isContainerOnlyImage = (image: RemoteImage): boolean => {
  if (isVmOnlyImage(image)) {
    return false;
  }
  const vmFiles = ["disk1.img", "disk-kvm.img", "uefi1.img"];
  return (
    Object.entries(image.versions ?? {}).find((version) =>
      Object.entries(version[1].items).find((item) =>
        vmFiles.includes(item[1].ftype),
      ),
    ) === undefined
  );
};

export const LOCAL_ISO = "local-iso";

export const isoToRemoteImage = (volume: LxdStorageVolume): RemoteImage => {
  return {
    aliases: volume.name,
    arch: "",
    os: "Custom ISO",
    pool: volume.pool,
    release: "-",
    server: LOCAL_ISO,
    type: "virtual-machine",
    variant: "iso",
    created_at: new Date(volume.created_at).getTime(),
    volume: volume,
  };
};

export const LOCAL_IMAGE = "local-image";

export const localLxdToRemoteImage = (image: LxdImage): RemoteImage => {
  const isLTS = image.properties?.description
    ?.toLocaleLowerCase()
    .includes("lts");
  const releaseTitle = `${image.properties?.version ?? ""}${isLTS ? " LTS" : ""}`;

  return {
    aliases: image.update_source?.alias ?? image.aliases?.[0]?.name ?? "",
    fingerprint: image.fingerprint,
    arch: image.architecture === "x86_64" ? "amd64" : image.architecture,
    os: capitalizeFirstLetter(image.properties?.os ?? ""),
    created_at: new Date(image.uploaded_at).getTime(),
    release: image.properties?.release ?? "",
    release_title: releaseTitle,
    type: image.type,
    cached: image.cached,
    server: image.cached ? image.update_source?.server : LOCAL_IMAGE,
    variant: image.properties?.variant,
  };
};

export const byLtsFirst = (a: RemoteImage, b: RemoteImage): number => {
  if (a.aliases.includes("lts")) {
    return -1;
  }
  if (b.aliases.includes("lts")) {
    return 1;
  }
  return 0;
};

export const byOSRelease = (a: RemoteImage, b: RemoteImage): number => {
  const aTitle = a.os + a.release_title + a.release + a.type + a.server;
  const bTitle = b.os + b.release_title + b.release + b.type + b.server;

  if (aTitle < bTitle) {
    return -1;
  }
  if (aTitle > bTitle) {
    return 1;
  }
  return 0;
};

export const getImageName = (image: LxdImage): string => {
  return image.properties?.description ?? image.fingerprint;
};

export const getImageAlias = (image: LxdImage): string => {
  return image.aliases.map((alias) => alias.name).join(", ");
};

// API format for aliases on image posts
// @see https://github.com/canonical/lxd/blob/main/shared/api/image.go#L60-L64
export const imageAliasPost = (aliases: string) => {
  return aliases.split(",").map((alias) => ({
    name: alias,
  }));
};
