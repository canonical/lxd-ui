import { TIMEOUT_120, TIMEOUT_60, watchOperation } from "./operations";
import { handleResponse } from "util/helpers";
import { LxdInstance, LxdSnapshot } from "types/instance";
import { LxdOperation } from "types/operation";

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
      .then((data: LxdOperation) => {
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
      .then((data: LxdOperation) => {
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
      .catch((e: Error) => {
        // A hack to ignore this error, should be removed once fixed in
        // @see https://github.com/lxc/lxd/issues/11538
        const msg =
          "Instance snapshot record count doesn't match instance snapshot volume record count";
        const isNotError = e.toString().includes(msg);
        if (isNotError) {
          setTimeout(() => resolve(e), 1000);
        } else {
          reject(e);
        }
      });
  });
};

export const restoreSnapshot = (
  instance: LxdInstance,
  snapshot: LxdSnapshot
) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${instance.name}?project=${instance.project}`, {
      method: "PUT",
      body: JSON.stringify({
        restore: snapshot.name,
      }),
    })
      .then(handleResponse)
      .then((data: LxdOperation) => {
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};
