import type { LxdImage, RemoteImage } from "types/image";
import type { LxdStorageVolume } from "types/storage";
import { capitalizeFirstLetter } from "./helpers";
import { instanceCreationTypes } from "./instanceOptions";

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
  if (a.aliases.includes("lts") || a.isLts) {
    return -1;
  }
  if (b.aliases.includes("lts") || b.isLts) {
    return 1;
  }
  return 0;
};

const getImageInfo = (img: RemoteImage | LxdImage): string => {
  if ("os" in img) {
    // RemoteImage
    const os = img.os || "";
    const release = img.release_title || img.release || "";
    const type = img.type || "";
    const server = img.server || "";
    return `${os} ${release} ${type} ${server}`.toLowerCase();
  } else {
    // LxdImage
    const p = img.properties;
    const isLts = p?.description?.toLowerCase()?.includes("lts") ?? false;
    const os = p?.os || "";
    const release = `${p?.version || p?.release || ""}${isLts ? " LTS" : ""}`;
    const type = img.type;
    const server = img.cached ? img.update_source?.server || "" : LOCAL_IMAGE;
    return `${os} ${release} ${type} ${server}`.toLowerCase();
  }
};

export const byOSRelease = (
  a: RemoteImage | LxdImage,
  b: RemoteImage | LxdImage,
): number => {
  const aOS = ("os" in a ? a.os : a.properties?.os || "").toLowerCase();
  const bOS = ("os" in b ? b.os : b.properties?.os || "").toLowerCase();

  // First sort by OS alphabetically
  const osCompare = aOS.localeCompare(bOS);
  if (osCompare !== 0) {
    return osCompare;
  }

  const aRelease =
    "os" in a
      ? a.release_title || a.release || ""
      : `${a.properties?.version || a.properties?.release || ""}${a.properties?.description?.toLowerCase()?.includes("lts") ? " LTS" : ""}`;
  const bRelease =
    "os" in b
      ? b.release_title || b.release || ""
      : `${b.properties?.version || b.properties?.release || ""}${b.properties?.description?.toLowerCase()?.includes("lts") ? " LTS" : ""}`;

  const aBaseVersion = aRelease.replace(/ LTS$/i, "");
  const bBaseVersion = bRelease.replace(/ LTS$/i, "");

  // If base versions are the same, prioritize LTS
  if (aBaseVersion === bBaseVersion) {
    const aIsLts = aRelease.toLowerCase().includes("lts");
    const bIsLts = bRelease.toLowerCase().includes("lts");

    if (aIsLts && !bIsLts) return -1;
    if (!aIsLts && bIsLts) return 1;

    // If same LTS status, sort by type (container before virtual-machine)
    const aType = "os" in a ? a.type || "" : a.type || "";
    const bType = "os" in b ? b.type || "" : b.type || "";

    if (aType !== bType) {
      if (aType === "container" && bType === "virtual-machine") return -1;
      if (aType === "virtual-machine" && bType === "container") return 1;
    }
  }

  // For different versions or same LTS status, use full info string with reverse sort
  const aInfo = getImageInfo(a);
  const bInfo = getImageInfo(b);
  return bInfo.localeCompare(aInfo);
};

export const getImageName = (image: LxdImage): string => {
  return image.properties?.description ?? image.fingerprint;
};

export const getImageAlias = (image: LxdImage) => {
  return image.aliases?.map((alias) => alias.name).join(", ");
};

// API format for aliases on image posts
// @see https://github.com/canonical/lxd/blob/main/shared/api/image.go#L60-L64
export const imageAliasPost = (aliases: string) => {
  return aliases.split(",").map((alias) => ({
    name: alias,
  }));
};

export const getImageTypeDisplayName = (image: LxdImage): string => {
  const typeOption = instanceCreationTypes.find(
    (option) => option.value === image.type,
  );
  return typeOption?.label ?? "Container";
};

export const getTypeFromDisplayName = (displayName: string): string => {
  const typeOption = instanceCreationTypes.find(
    (option) => option.label === displayName,
  );
  return typeOption?.value ?? displayName.toLowerCase();
};
