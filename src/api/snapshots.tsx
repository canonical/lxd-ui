import { TIMEOUT_120, TIMEOUT_60, watchOperation } from "./operations";
import { handleResponse } from "util/helpers";
import { LxdInstance, LxdSnapshot } from "types/instance";
import { LxdOperationResponse } from "types/operation";

export const createSnapshot = (
  instance: LxdInstance,
  name: string,
  expiresAt: string | null,
  stateful: boolean
) => {
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
      }
    )
      .then(handleResponse)
      .then((data: LxdOperationResponse) => {
        watchOperation(data.operation, TIMEOUT_60).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const deleteSnapshot = (
  instance: LxdInstance,
  snapshot: { name: string }
) => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/instances/${instance.name}/snapshots/${snapshot.name}?project=${instance.project}`,
      {
        method: "DELETE",
      }
    )
      .then(handleResponse)
      .then((data: LxdOperationResponse) => {
        watchOperation(data.operation, TIMEOUT_120).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const deleteSnapshotBulk = (
  instance: LxdInstance,
  snapshotNames: string[]
) => {
  return new Promise((resolve, reject) => {
    Promise.all(
      snapshotNames.map(
        async (name) => await deleteSnapshot(instance, { name })
      )
    )
      .then(resolve)
      .catch(reject);
  });
};

export const restoreSnapshot = (
  instance: LxdInstance,
  snapshot: LxdSnapshot,
  restoreState: boolean
) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${instance.name}?project=${instance.project}`, {
      method: "PUT",
      body: JSON.stringify({
        restore: snapshot.name,
        stateful: snapshot.stateful ? restoreState : false,
      }),
    })
      .then(handleResponse)
      .then((data: LxdOperationResponse) => {
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const renameSnapshot = (
  instance: LxdInstance,
  snapshot: LxdSnapshot,
  newName: string
) => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/instances/${instance.name}/snapshots/${snapshot.name}?project=${instance.project}`,
      {
        method: "POST",
        body: JSON.stringify({
          name: newName,
        }),
      }
    )
      .then(handleResponse)
      .then((data: LxdOperationResponse) => {
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const updateSnapshot = (
  instance: LxdInstance,
  snapshot: LxdSnapshot,
  expiresAt: string
) => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/instances/${instance.name}/snapshots/${snapshot.name}?project=${instance.project}`,
      {
        method: "PUT",
        body: JSON.stringify({
          expires_at: expiresAt,
        }),
      }
    )
      .then(handleResponse)
      .then((data: LxdOperationResponse) => {
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};
