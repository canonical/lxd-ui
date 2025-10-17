import { handleResponse } from "util/helpers";
import type { BulkOperationItem, BulkOperationResult } from "util/promises";
import { continueOrFinish, pushFailure, pushSuccess } from "util/promises";
import type { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import type { LxdOperationResponse } from "types/operation";
import type { EventQueue } from "context/eventQueue";
import { linkForInstanceDetail } from "util/instances";

export const createInstanceSnapshot = async (
  instance: LxdInstance,
  name: string,
  expiresAt: string | null,
  stateful: boolean,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", instance.project);

  return fetch(
    `/1.0/instances/${encodeURIComponent(instance.name)}/snapshots?${params.toString()}`,
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
  const params = new URLSearchParams();
  params.set("project", instance.project);

  return fetch(
    `/1.0/instances/${encodeURIComponent(instance.name)}/snapshots/${encodeURIComponent(snapshot.name)}?${params.toString()}`,
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
): Promise<BulkOperationResult[]> => {
  const results: BulkOperationResult[] = [];
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      snapshotNames.map(async (name) => {
        const item: BulkOperationItem = {
          name: name,
          type: "snapshot",
          href: `${linkForInstanceDetail(instance.name, instance.project)}/snapshots`,
        };
        await deleteInstanceSnapshot(instance, { name })
          .then((operation) => {
            eventQueue.set(
              operation.metadata.id,
              () => {
                pushSuccess(results, item);
              },
              (msg) => {
                pushFailure(results, msg, item);
              },
              () => {
                continueOrFinish(results, snapshotNames.length, resolve);
              },
            );
          })
          .catch((e) => {
            pushFailure(results, e instanceof Error ? e.message : "", item);
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
  const params = new URLSearchParams();
  params.set("project", instance.project);

  return fetch(
    `/1.0/instances/${encodeURIComponent(instance.name)}?${params.toString()}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        restore: snapshot.name,
        stateful: snapshot.stateful ? restoreState : false,
      }),
    },
  )
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
  const params = new URLSearchParams();
  params.set("project", instance.project);

  return fetch(
    `/1.0/instances/${encodeURIComponent(instance.name)}/snapshots/${encodeURIComponent(snapshot.name)}?${params.toString()}`,
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
  const params = new URLSearchParams();
  params.set("project", instance.project);

  return fetch(
    `/1.0/instances/${encodeURIComponent(instance.name)}/snapshots/${encodeURIComponent(snapshot.name)}?${params.toString()}`,
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
