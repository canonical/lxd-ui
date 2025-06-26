import { handleResponse } from "util/helpers";
import { continueOrFinish, pushFailure, pushSuccess } from "util/promises";
import type { LxdOperationResponse } from "types/operation";
import type { LxdStorageVolume, LxdVolumeSnapshot } from "types/storage";
import type { LxdApiResponse } from "types/apiResponse";
import type { EventQueue } from "context/eventQueue";
import { splitVolumeSnapshotName } from "util/storageVolume";
import { getTargetParam } from "api/storage-volumes";

export const createVolumeSnapshot = async (
  volume: LxdStorageVolume,
  name: string,
  expiresAt: string | null,
): Promise<LxdOperationResponse> => {
  const targetParam = getTargetParam(volume.location);
  return fetch(
    `/1.0/storage-pools/${volume.pool}/volumes/custom/${volume.name}/snapshots?project=${volume.project}${targetParam}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        expires_at: expiresAt,
      }),
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const deleteVolumeSnapshot = async (
  volume: LxdStorageVolume,
  snapshot: Pick<LxdVolumeSnapshot, "name">,
): Promise<LxdOperationResponse> => {
  const targetParam = getTargetParam(volume.location);
  return fetch(
    `/1.0/storage-pools/${volume.pool}/volumes/${volume.type}/${volume.name}/snapshots/${snapshot.name}?project=${volume.project}&${targetParam}`,
    {
      method: "DELETE",
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const deleteVolumeSnapshotBulk = async (
  volume: LxdStorageVolume,
  snapshotNames: string[],
  eventQueue: EventQueue,
): Promise<PromiseSettledResult<void>[]> => {
  const results: PromiseSettledResult<void>[] = [];
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      snapshotNames.map(async (name) => {
        await deleteVolumeSnapshot(volume, { name })
          .then((operation) => {
            eventQueue.set(
              operation.metadata.id,
              () => {
                pushSuccess(results);
              },
              (msg) => {
                pushFailure(results, msg);
              },
              () => {
                continueOrFinish(results, snapshotNames.length, resolve);
              },
            );
          })
          .catch((e) => {
            pushFailure(results, e instanceof Error ? e.message : "");
            continueOrFinish(results, snapshotNames.length, resolve);
          });
      }),
    ).catch(reject);
  });
};

// NOTE: this api endpoint results in a synchronous operation
export const restoreVolumeSnapshot = async (
  volume: LxdStorageVolume,
  snapshot: LxdVolumeSnapshot,
): Promise<void> => {
  const targetParam = getTargetParam(volume.location);
  await fetch(
    `/1.0/storage-pools/${volume.pool}/volumes/${volume.type}/${volume.name}?project=${volume.project}${targetParam}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        restore: snapshot.name,
      }),
    },
  ).then(handleResponse);
};

export const renameVolumeSnapshot = async (
  volume: LxdStorageVolume,
  snapshot: LxdVolumeSnapshot,
  newName: string,
): Promise<LxdOperationResponse> => {
  const targetParam = getTargetParam(volume.location);
  return fetch(
    `/1.0/storage-pools/${volume.pool}/volumes/${volume.type}/${volume.name}/snapshots/${snapshot.name}?project=${volume.project}${targetParam}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newName,
      }),
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

// NOTE: this api endpoint results in a synchronous operation
export const updateVolumeSnapshot = async (
  volume: LxdStorageVolume,
  snapshot: LxdVolumeSnapshot,
  expiresAt: string | null,
): Promise<void> => {
  const targetParam = getTargetParam(volume.location);
  await fetch(
    `/1.0/storage-pools/${volume.pool}/volumes/${volume.type}/${volume.name}/snapshots/${snapshot.name}?project=${volume.project}${targetParam}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expires_at: expiresAt,
      }),
    },
  ).then(handleResponse);
};

export const fetchStorageVolumeSnapshots = async (
  volume: LxdStorageVolume,
): Promise<LxdVolumeSnapshot[]> => {
  const targetParam = getTargetParam(volume.location);
  return fetch(
    `/1.0/storage-pools/${volume.pool}/volumes/${volume.type}/${volume.name}/snapshots?project=${volume.project}${targetParam}&recursion=2`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdVolumeSnapshot[]>) => {
      return data.metadata.map((snapshot) => ({
        ...snapshot,
        name: splitVolumeSnapshotName(snapshot.name).snapshotName,
      }));
    });
};
