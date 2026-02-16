import type { LxdOperation } from "types/operation";
import type { LxdEvent } from "types/event";

const getOperationEntityUrls = (
  entities?: string[],
  operation?: LxdOperation,
): string[] => {
  const candidates = entities ?? [];
  if (operation?.metadata?.["entity_url"]) {
    candidates.push(operation.metadata["entity_url"]);
  }
  return candidates;
};

export const getInstanceName = (operation?: LxdOperation): string => {
  // the url can be one of below formats
  // /1.0/instances/<instance_name>
  // /1.0/instances/<instance_name>?project=<project_name>
  const candidates = getOperationEntityUrls(
    operation?.resources?.instances,
    operation,
  );
  if (operation?.resources?.instance) {
    candidates.push(...operation.resources.instance);
  }
  return (
    candidates
      ?.filter((item) => item.startsWith("/1.0/instances/"))
      .map((item) => item.split("/")[3])
      .pop()
      ?.split("?")[0] ?? ""
  );
};

export const getInstanceSnapshotName = (operation?: LxdOperation): string => {
  // /1.0/instances/<instance_name>/snapshots/<snapshot_name>
  const instanceSnapshots = getOperationEntityUrls(
    operation?.resources?.instances_snapshots,
    operation,
  );
  if (instanceSnapshots.length) {
    return instanceSnapshots[0].split("/")[5].split("?")[0];
  }

  return "";
};

export const getVolumeSnapshotName = (operation?: LxdOperation): string => {
  // /1.0/storage-pools/<pool_name>/volumes/custom/<volume_name>/snapshots/<snapshot_name>
  const storageVolumeSnapshots = getOperationEntityUrls(
    operation?.resources?.storage_volume_snapshots,
    operation,
  );

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

  const images = getOperationEntityUrls(
    operation?.resources?.images,
    operation,
  );
  if (images.length > 0) {
    return (
      images
        .filter((item) => item.startsWith("/1.0/images/"))
        .map((item) => item.split("project=")[1])
        .pop()
        ?.split("&")[0] ?? "default"
    );
  }

  const instances = getOperationEntityUrls(
    operation.resources?.instances,
    operation,
  );
  return (
    instances
      .filter((item) => item.startsWith("/1.0/instances/"))
      .map((item) => item.split("project=")[1])
      .pop()
      ?.split("&")[0] ?? "default"
  );
};

export const getFingerprint = (result: LxdEvent | LxdOperation): string => {
  const event = result as LxdEvent;
  if (event.metadata?.metadata?.fingerprint) {
    return event.metadata.metadata.fingerprint;
  }
  const operation = result as LxdOperation;
  if (operation?.metadata?.fingerprint) {
    return operation.metadata.fingerprint;
  }
  return "";
};
