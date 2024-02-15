import { LxdImage, RemoteImage } from "types/image";
import { LxdStorageVolume } from "types/storage";

export const isVmOnlyImage = (image: RemoteImage): boolean | undefined => {
  if (image.server === LOCAL_ISO) {
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
    variant: "iso",
    created_at: new Date(volume.created_at).getTime(),
    volume: volume,
  };
};

export const localLxdToRemoteImage = (image: LxdImage): RemoteImage => {
  return {
    aliases: image.update_source?.alias ?? image.fingerprint,
    arch: image.architecture === "x86_64" ? "amd64" : image.architecture,
    os: image.properties.os,
    created_at: new Date(image.uploaded_at).getTime(),
    release: image.properties.release,
    server: image.update_source?.server,
    type: image.type,
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
