import type { LxdOperation } from "types/operation";

export const getInstanceName = (operation?: LxdOperation): string => {
  // the url can be one of below formats
  // /1.0/instances/<instance_name>
  // /1.0/instances/<instance_name>?project=<project_name>
  return (
    operation?.resources?.instances
      ?.filter((item) => item.startsWith("/1.0/instances/"))
      .map((item) => item.split("/")[3])
      .pop()
      ?.split("?")[0] ?? ""
  );
};

export const getInstanceSnapshotName = (operation?: LxdOperation): string => {
  // /1.0/instances/<instance_name>/snapshots/<snapshot_name>
  const instanceSnapshots = operation?.resources?.instances_snapshots ?? [];
  if (instanceSnapshots.length) {
    return instanceSnapshots[0].split("/")[5].split("?")[0];
  }

  return "";
};

export const getVolumeSnapshotName = (operation?: LxdOperation): string => {
  // /1.0/storage-pools/<pool_name>/volumes/custom/<volume_name>/snapshots/<snapshot_name>
  const storageVolumeSnapshots =
    operation?.resources?.storage_volume_snapshots ?? [];

  if (storageVolumeSnapshots.length) {
    return storageVolumeSnapshots[0].split("/")[8].split("?")[0];
  }

  return "";
};

export const getProjectName = (operation?: LxdOperation): string => {
  // the url can be
  // /1.0/images/<image_fingerprint>?project=<project_name>
  // /1.0/instances/<instance_name>?project=<project_name>
  // /1.0/instances/<instance_name>?other=params&project=<project_name>
  // /1.0/instances/<instance_name>?other=params&project=<project_name>&other=params
  // when no project parameter is present, the project will be "default"

  if (!operation) {
    return "default";
  }

  const images = operation.resources?.images ?? [];
  if (images.length > 0) {
    return (
      images
        .filter((item) => item.startsWith("/1.0/images/"))
        .map((item) => item.split("project=")[1])
        .pop()
        ?.split("&")[0] ?? "default"
    );
  }

  const instances = operation.resources?.instances ?? [];
  return (
    instances
      .filter((item) => item.startsWith("/1.0/instances/"))
      .map((item) => item.split("project=")[1])
      .pop()
      ?.split("&")[0] ?? "default"
  );
};
