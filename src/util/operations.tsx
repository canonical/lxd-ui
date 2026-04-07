import type { ReactNode } from "react";
import type { LxdOperation } from "types/operation";
import type { LxdEvent } from "types/event";
import type { LxdOperationResponse } from "types/operation";
import { InstanceRichChip } from "pages/instances/InstanceRichChip";

// Extracts entity URLs from an operation, considering renaming operations where the original_entity_url is returned.
const getOperationEntityUrls = (
  operation?: LxdOperation,
  entities: string[] = [],
): string[] => {
  const candidates = new Set<string>(entities);

  if (operation?.metadata?.original_entity_url) {
    candidates.add(operation.metadata.original_entity_url);
  } else if (operation?.metadata?.entity_url) {
    candidates.add(operation.metadata.entity_url);
  }
  return Array.from(candidates);
};

export const getInstanceName = (operation?: LxdOperation): string => {
  // the url can be one of below formats
  // /1.0/instances/<instance_name>
  // /1.0/instances/<instance_name>?project=<project_name>

  const resources = [
    ...(operation?.resources?.instances || []),
    ...(operation?.resources?.instance || []),
  ];
  const candidates = getOperationEntityUrls(operation, resources);

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
    operation,
    operation?.resources?.instances_snapshots,
  );
  if (instanceSnapshots.length) {
    return instanceSnapshots[0].split("/")[5].split("?")[0];
  }

  return "";
};

export const getVolumeSnapshotName = (operation?: LxdOperation): string => {
  // /1.0/storage-pools/<pool_name>/volumes/custom/<volume_name>/snapshots/<snapshot_name>
  const storageVolumeSnapshots = getOperationEntityUrls(
    operation,
    operation?.resources?.storage_volume_snapshots,
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

  const urls = getOperationEntityUrls(operation, [
    ...(operation.resources?.instances || []),
    ...(operation.resources?.images || []),
  ]);
  if (urls.length === 0) {
    return "default";
  }

  const imageURLs = urls.filter((item) => item.startsWith("/1.0/images/"));
  if (imageURLs.length > 0) {
    return (
      imageURLs
        .map((item) => item.split("project=")[1])
        .pop()
        ?.split("&")[0] ?? "default"
    );
  }
  return (
    urls
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

export const isRestoringBackup = (operation: LxdOperation): boolean => {
  return operation.description === "Restoring backup";
};

export const isCreatingInstance = (operation: LxdOperation): boolean => {
  return operation.description === "Creating instance";
};

export const instanceLinkFromOperation = (args: {
  operation?: LxdOperationResponse;
  project?: string;
}): ReactNode | undefined => {
  const { operation, project } = args;
  const instanceName = getInstanceName(operation?.metadata);
  if (!instanceName) {
    return;
  }
  return (
    <InstanceRichChip
      instanceName={instanceName}
      projectName={project || "default"}
    />
  );
};
