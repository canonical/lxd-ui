import {
  continueOrFinish,
  handleResponse,
  pushFailure,
  pushSuccess,
} from "util/helpers";
import { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import { LxdOperationResponse } from "types/operation";
import { EventQueue } from "context/eventQueue";

export const createInstanceSnapshot = (
  instance: LxdInstance,
  name: string,
  expiresAt: string | null,
  stateful: boolean,
): Promise<LxdOperationResponse> => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/instances/${instance.name}/snapshots?project=${instance.project}`,
      {
        method: "POST",
        body: JSON.stringify({
          name,
          expires_at: expiresAt,
          stateful,
        }),
      },
    )
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const deleteInstanceSnapshot = (
  instance: LxdInstance,
  snapshot: { name: string },
): Promise<LxdOperationResponse> => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/instances/${instance.name}/snapshots/${snapshot.name}?project=${instance.project}`,
      {
        method: "DELETE",
      },
    )
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const deleteInstanceSnapshotBulk = (
  instance: LxdInstance,
  snapshotNames: string[],
  eventQueue: EventQueue,
): Promise<PromiseSettledResult<void>[]> => {
  const results: PromiseSettledResult<void>[] = [];
  return new Promise((resolve) => {
    void Promise.allSettled(
      snapshotNames.map(async (name) => {
        return await deleteInstanceSnapshot(instance, { name })
          .then((operation) => {
            eventQueue.set(
              operation.metadata.id,
              () => pushSuccess(results),
              (msg) => pushFailure(results, msg),
              () => continueOrFinish(results, snapshotNames.length, resolve),
            );
          })
          .catch((e) => {
            pushFailure(results, e instanceof Error ? e.message : "");
            continueOrFinish(results, snapshotNames.length, resolve);
          });
      }),
    );
  });
};

export const restoreInstanceSnapshot = (
  instance: LxdInstance,
  snapshot: LxdInstanceSnapshot,
  restoreState: boolean,
): Promise<LxdOperationResponse> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${instance.name}?project=${instance.project}`, {
      method: "PUT",
      body: JSON.stringify({
        restore: snapshot.name,
        stateful: snapshot.stateful ? restoreState : false,
      }),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const renameInstanceSnapshot = (
  instance: LxdInstance,
  snapshot: LxdInstanceSnapshot,
  newName: string,
): Promise<LxdOperationResponse> => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/instances/${instance.name}/snapshots/${snapshot.name}?project=${instance.project}`,
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

export const updateInstanceSnapshot = (
  instance: LxdInstance,
  snapshot: LxdInstanceSnapshot,
  expiresAt: string,
): Promise<LxdOperationResponse> => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/instances/${instance.name}/snapshots/${snapshot.name}?project=${instance.project}`,
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
