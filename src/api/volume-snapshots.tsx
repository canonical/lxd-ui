import { handleResponse } from "util/helpers";
import { continueOrFinish, pushFailure, pushSuccess } from "util/promises";
import type { LxdOperationResponse } from "types/operation";
import type { LxdStorageVolume, LxdVolumeSnapshot } from "types/storage";
import type { LxdApiResponse, LxdSyncResponse } from "types/apiResponse";
import type { EventQueue } from "context/eventQueue";
import { splitVolumeSnapshotName } from "util/storageVolume";
import { getTargetParam } from "api/storage-volumes";

export const createVolumeSnapshot = async (
  volume: LxdStorageVolume,
  name: string,
  expiresAt: string | null,
): Promise<LxdOperationResponse> => {
  const targetParam = getTargetParam(volume.location);
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/storage-pools/${volume.pool}/volumes/custom/${volume.name}/snapshots?project=${volume.project}${targetParam}`,
      {
        method: "POST",
        body: JSON.stringify({
          name,
          expires_at: expiresAt,
        }),
      },
    )
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const deleteVolumeSnapshot = async (
  volume: LxdStorageVolume,
  snapshot: Pick<LxdVolumeSnapshot, "name">,
): Promise<LxdOperationResponse> => {
  const targetParam = getTargetParam(volume.location);
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/storage-pools/${volume.pool}/volumes/${volume.type}/${volume.name}/snapshots/${snapshot.name}?project=${volume.project}&${targetParam}`,
      {
        method: "DELETE",
      },
    )
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
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
): Promise<LxdSyncResponse<unknown>> => {
  const targetParam = getTargetParam(volume.location);
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/storage-pools/${volume.pool}/volumes/${volume.type}/${volume.name}?project=${volume.project}${targetParam}`,
      {
        method: "PUT",
        body: JSON.stringify({
          restore: snapshot.name,
        }),
      },
    )
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const renameVolumeSnapshot = async (
  volume: LxdStorageVolume,
  snapshot: LxdVolumeSnapshot,
  newName: string,
): Promise<LxdOperationResponse> => {
  const targetParam = getTargetParam(volume.location);
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/storage-pools/${volume.pool}/volumes/${volume.type}/${volume.name}/snapshots/${snapshot.name}?project=${volume.project}${targetParam}`,
      {
        method: "POST",
        body: JSON.stringify({
          name: newName,
        }),
      },
    )
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

// NOTE: this api endpoint results in a synchronous operation
export const updateVolumeSnapshot = async (
  volume: LxdStorageVolume,
  snapshot: LxdVolumeSnapshot,
  expiresAt: string | null,
): Promise<LxdSyncResponse<unknown>> => {
  const targetParam = getTargetParam(volume.location);
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/storage-pools/${volume.pool}/volumes/${volume.type}/${volume.name}/snapshots/${snapshot.name}?project=${volume.project}${targetParam}`,
      {
        method: "PUT",
        body: JSON.stringify({
          expires_at: expiresAt,
        }),
      },
    )
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const fetchStorageVolumeSnapshots = async (
  volume: LxdStorageVolume,
): Promise<LxdVolumeSnapshot[]> => {
  const targetParam = getTargetParam(volume.location);
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/storage-pools/${volume.pool}/volumes/${volume.type}/${volume.name}/snapshots?project=${volume.project}${targetParam}&recursion=2`,
    )
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdVolumeSnapshot[]>) => {
        resolve(
          data.metadata.map((snapshot) => ({
            ...snapshot,
            name: splitVolumeSnapshotName(snapshot.name).snapshotName,
          })),
        );
      })
      .catch(reject);
  });
};
