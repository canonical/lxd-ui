import { watchOperation } from "./operations";
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
        watchOperation(data.operation, 60).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const deleteSnapshot = (
  instance: LxdInstance,
  snapshot: LxdSnapshot
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
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
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
