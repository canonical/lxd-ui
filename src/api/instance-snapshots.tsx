import { handleResponse } from "util/helpers";
import { continueOrFinish, pushFailure, pushSuccess } from "util/promises";
import type { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import type { LxdOperationResponse } from "types/operation";
import type { EventQueue } from "context/eventQueue";

export const createInstanceSnapshot = async (
  instance: LxdInstance,
  name: string,
  expiresAt: string | null,
  stateful: boolean,
): Promise<LxdOperationResponse> => {
  return fetch(
    `/1.0/instances/${instance.name}/snapshots?project=${instance.project}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        expires_at: expiresAt,
        stateful,
      }),
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const deleteInstanceSnapshot = async (
  instance: LxdInstance,
  snapshot: { name: string },
): Promise<LxdOperationResponse> => {
  return fetch(
    `/1.0/instances/${instance.name}/snapshots/${snapshot.name}?project=${instance.project}`,
    {
      method: "DELETE",
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const deleteInstanceSnapshotBulk = async (
  instance: LxdInstance,
  snapshotNames: string[],
  eventQueue: EventQueue,
): Promise<PromiseSettledResult<void>[]> => {
  const results: PromiseSettledResult<void>[] = [];
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      snapshotNames.map(async (name) => {
        await deleteInstanceSnapshot(instance, { name })
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

export const restoreInstanceSnapshot = async (
  instance: LxdInstance,
  snapshot: LxdInstanceSnapshot,
  restoreState: boolean,
): Promise<LxdOperationResponse> => {
  return fetch(`/1.0/instances/${instance.name}?project=${instance.project}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      restore: snapshot.name,
      stateful: snapshot.stateful ? restoreState : false,
    }),
  })
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const renameInstanceSnapshot = async (
  instance: LxdInstance,
  snapshot: LxdInstanceSnapshot,
  newName: string,
): Promise<LxdOperationResponse> => {
  return fetch(
    `/1.0/instances/${instance.name}/snapshots/${snapshot.name}?project=${instance.project}`,
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

export const updateInstanceSnapshot = async (
  instance: LxdInstance,
  snapshot: LxdInstanceSnapshot,
  expiresAt: string,
): Promise<LxdOperationResponse> => {
  return fetch(
    `/1.0/instances/${instance.name}/snapshots/${snapshot.name}?project=${instance.project}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expires_at: expiresAt,
      }),
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};
