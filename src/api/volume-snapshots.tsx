import { handleResponse } from "util/helpers";
import { continueOrFinish, pushFailure, pushSuccess } from "util/promises";
import type { LxdOperationResponse } from "types/operation";
import type { LxdStorageVolume, LxdVolumeSnapshot } from "types/storage";
import type { LxdApiResponse } from "types/apiResponse";
import type { EventQueue } from "context/eventQueue";
import { splitVolumeSnapshotName } from "util/storageVolume";
import { addTarget } from "util/target";

export const createVolumeSnapshot = async (
  volume: LxdStorageVolume,
  name: string,
  expiresAt: string | null,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", volume.project);
  addTarget(params, volume.location);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(volume.pool)}/volumes/custom/${encodeURIComponent(volume.name)}/snapshots?${params.toString()}`,
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
  const params = new URLSearchParams();
  params.set("project", volume.project);
  addTarget(params, volume.location);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(volume.pool)}/volumes/${encodeURIComponent(volume.type)}/${encodeURIComponent(volume.name)}/snapshots/${encodeURIComponent(snapshot.name)}?${params.toString()}`,
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
  const params = new URLSearchParams();
  params.set("project", volume.project);
  addTarget(params, volume.location);

  await fetch(
    `/1.0/storage-pools/${encodeURIComponent(volume.pool)}/volumes/${encodeURIComponent(volume.type)}/${encodeURIComponent(volume.name)}?${params.toString()}`,
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
  const params = new URLSearchParams();
  params.set("project", volume.project);
  addTarget(params, volume.location);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(volume.pool)}/volumes/${encodeURIComponent(volume.type)}/${encodeURIComponent(volume.name)}/snapshots/${encodeURIComponent(snapshot.name)}?${params.toString()}`,
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
  const params = new URLSearchParams();
  params.set("project", volume.project);
  addTarget(params, volume.location);

  await fetch(
    `/1.0/storage-pools/${encodeURIComponent(volume.pool)}/volumes/${encodeURIComponent(volume.type)}/${encodeURIComponent(volume.name)}/snapshots/${encodeURIComponent(snapshot.name)}?${params.toString()}`,
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
  const params = new URLSearchParams();
  params.set("project", volume.project);
  params.set("recursion", "2");
  addTarget(params, volume.location);

  return fetch(
    `/1.0/storage-pools/${encodeURIComponent(volume.pool)}/volumes/${encodeURIComponent(volume.type)}/${encodeURIComponent(volume.name)}/snapshots?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdVolumeSnapshot[]>) => {
      return data.metadata.map((snapshot) => ({
        ...snapshot,
        name: splitVolumeSnapshotName(snapshot.name).snapshotName,
      }));
    });
};
