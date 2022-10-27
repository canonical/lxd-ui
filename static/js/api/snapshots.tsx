import { watchOperation } from "./operations";
import { handleResponse } from "../helpers";
import { LxdInstance, LxdSnapshot } from "../types/instance";

export const createSnapshot = (
  instance: LxdInstance,
  name: string,
  expiresAt: string | null,
  stateful: boolean
) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${instance.name}/snapshots`, {
      method: "POST",
      body: JSON.stringify({
        name,
        expires_at: expiresAt,
        stateful,
      }),
    })
      .then(handleResponse)
      .then((data) => {
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const deleteSnapshot = (
  instance: LxdInstance,
  snapshot: LxdSnapshot
) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${instance.name}/snapshots/${snapshot.name}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then((data) => {
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
    fetch(`/1.0/instances/${instance.name}`, {
      method: "PUT",
      body: JSON.stringify({
        restore: snapshot.name,
      }),
    })
      .then(handleResponse)
      .then((data) => {
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};
