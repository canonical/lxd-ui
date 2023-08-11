import { LxdImage, RemoteImage } from "types/image";
import { LxdStorageVolume } from "types/storage";

export const isVmOnlyImage = (image: RemoteImage) => {
  return image.variant?.includes("desktop") || image.server === "local-iso";
};

export const isContainerOnlyImage = (image: RemoteImage) => {
  if (isVmOnlyImage(image)) {
    return false;
  }
  const vmFiles = ["disk1.img", "disk-kvm.img", "uefi1.img"];
  return (
    Object.entries(image.versions ?? {}).find((version) =>
      Object.entries(version[1].items).find((item) =>
        vmFiles.includes(item[1].ftype)
      )
    ) === undefined
  );
};

export const isoToRemoteImage = (
  volume: LxdStorageVolume,
  pool: string
): RemoteImage => {
  return {
    aliases: volume.name,
    arch: "",
    os: "Local image",
    pool: pool,
    release: "-",
    server: "local-iso",
    variant: "iso",
    created_at: new Date(volume.created_at).getTime(),
    volume: volume,
  };
};

export const cachedLxdToRemoteImage = (image: LxdImage): RemoteImage => {
  return {
    aliases: image.update_source?.alias ?? image.fingerprint,
    arch: image.architecture,
    os: image.properties.os,
    created_at: new Date(image.uploaded_at).getTime(),
    release: image.properties.release,
    server: image.update_source?.server,
  };
};
