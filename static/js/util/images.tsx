import { RemoteImage } from "../types/image";

export const isVmOnlyImage = (image: RemoteImage) => {
  return image.variant?.includes("desktop");
};

export const isContainerOnlyImage = (image: RemoteImage) => {
  const vmFiles = ["disk1.img", "disk-kvm.img", "uefi1.img"];
  return (
    Object.entries(image.versions ?? {}).find((version) =>
      Object.entries(version[1].items).find((item) =>
        vmFiles.includes(item[1].ftype)
      )
    ) === undefined
  );
};
