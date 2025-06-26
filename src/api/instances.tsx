import {
  handleEtagResponse,
  handleResponse,
  handleTextResponse,
} from "util/helpers";
import { continueOrFinish, pushFailure, pushSuccess } from "util/promises";
import type { LxdInstance, LxdInstanceAction } from "types/instance";
import type { LxdTerminal, TerminalConnectPayload } from "types/terminal";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdOperationResponse } from "types/operation";
import type { EventQueue } from "context/eventQueue";
import type { AxiosResponse } from "axios";
import axios from "axios";
import type { UploadState } from "types/storage";
import { withEntitlementsQuery } from "util/entitlements/api";

export const instanceEntitlements = [
  "can_access_console",
  "can_delete",
  "can_edit",
  "can_exec",
  "can_manage_backups",
  "can_manage_snapshots",
  "can_update_state",
];

export const fetchInstance = async (
  name: string,
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdInstance> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    instanceEntitlements,
  );
  return fetch(
    `/1.0/instances/${name}?project=${project}&recursion=2${entitlements}`,
  )
    .then(handleEtagResponse)
    .then((data) => {
      return data as LxdInstance;
    });
};

export const fetchInstances = async (
  project: string | null,
  isFineGrained: boolean | null,
): Promise<LxdInstance[]> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    instanceEntitlements,
  );
  const projectParam = project ? `project=${project}` : "all-projects=true";
  return fetch(`/1.0/instances?${projectParam}&recursion=2${entitlements}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdInstance[]>) => {
      return data.metadata;
    });
};

export const createInstance = async (
  body: string,
  project: string,
  target?: string,
): Promise<LxdOperationResponse> => {
  return fetch(`/1.0/instances?project=${project}&target=${target ?? ""}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  })
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const updateInstance = async (
  instance: LxdInstance,
  project: string,
): Promise<LxdOperationResponse> => {
  return fetch(`/1.0/instances/${instance.name}?project=${project}`, {
    method: "PUT",
    body: JSON.stringify(instance),
    headers: {
      "Content-Type": "application/json",
      "If-Match": instance.etag ?? "invalid-etag",
    },
  })
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const renameInstance = async (
  oldName: string,
  newName: string,
  project: string,
): Promise<LxdOperationResponse> => {
  return fetch(`/1.0/instances/${oldName}?project=${project}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: newName,
    }),
  })
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const migrateInstance = async (
  name: string,
  project: string,
  target?: string,
  pool?: string,
  targetProject?: string,
): Promise<LxdOperationResponse> => {
  let url = `/1.0/instances/${name}?project=${project}`;
  if (target) {
    url += `&target=${target}`;
  }

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      migration: true,
      pool,
      project: targetProject,
    }),
  })
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const startInstance = async (
  instance: LxdInstance,
): Promise<LxdOperationResponse> => {
  return putInstanceAction(instance.name, instance.project, "start");
};

export const stopInstance = async (
  instance: LxdInstance,
  isForce: boolean,
): Promise<LxdOperationResponse> => {
  return putInstanceAction(instance.name, instance.project, "stop", isForce);
};

export const freezeInstance = async (
  instance: LxdInstance,
): Promise<LxdOperationResponse> => {
  return putInstanceAction(instance.name, instance.project, "freeze");
};

export const unfreezeInstance = async (
  instance: LxdInstance,
): Promise<LxdOperationResponse> => {
  return putInstanceAction(instance.name, instance.project, "unfreeze");
};

export const restartInstance = async (
  instance: LxdInstance,
  isForce: boolean,
): Promise<LxdOperationResponse> => {
  return putInstanceAction(instance.name, instance.project, "restart", isForce);
};

const putInstanceAction = async (
  instance: string,
  project: string,
  action: LxdInstanceAction,
  isForce?: boolean,
): Promise<LxdOperationResponse> => {
  return fetch(`/1.0/instances/${instance}/state?project=${project}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: action,
      force: isForce,
    }),
  })
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export interface InstanceBulkAction {
  name: string;
  project: string;
  action: LxdInstanceAction;
}

export const updateInstanceBulkAction = async (
  actions: InstanceBulkAction[],
  isForce: boolean,
  eventQueue: EventQueue,
): Promise<PromiseSettledResult<void>[]> => {
  const results: PromiseSettledResult<void>[] = [];
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      actions.map(async ({ name, project, action }) => {
        await putInstanceAction(name, project, action, isForce)
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
                continueOrFinish(results, actions.length, resolve);
              },
            );
          })
          .catch((e) => {
            pushFailure(results, e instanceof Error ? e.message : "");
            continueOrFinish(results, actions.length, resolve);
          });
      }),
    ).catch(reject);
  });
};

export const deleteInstance = async (
  instance: LxdInstance,
): Promise<LxdOperationResponse> => {
  return fetch(`/1.0/instances/${instance.name}?project=${instance.project}`, {
    method: "DELETE",
  })
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const deleteInstanceBulk = async (
  instances: LxdInstance[],
  eventQueue: EventQueue,
): Promise<PromiseSettledResult<void>[]> => {
  const results: PromiseSettledResult<void>[] = [];
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      instances.map(async (instance) => {
        await deleteInstance(instance)
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
                continueOrFinish(results, instances.length, resolve);
              },
            );
          })
          .catch((e) => {
            pushFailure(results, e instanceof Error ? e.message : "");
            continueOrFinish(results, instances.length, resolve);
          });
      }),
    ).catch(reject);
  });
};

export const connectInstanceExec = async (
  name: string,
  project: string,
  payload: TerminalConnectPayload,
): Promise<LxdTerminal> => {
  return fetch(`/1.0/instances/${name}/exec?project=${project}&wait=10`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      command: [payload.command],
      "wait-for-websocket": true,
      environment: payload.environment.reduce(
        (a, v) => ({ ...a, [v.key]: v.value }),
        {},
      ),
      interactive: true,
      group: payload.group,
      user: payload.user,
    }),
  })
    .then(handleResponse)
    .then((data: LxdTerminal) => {
      return data;
    });
};

export const connectInstanceVga = async (
  name: string,
  project: string,
): Promise<LxdTerminal> => {
  return fetch(`/1.0/instances/${name}/console?project=${project}&wait=10`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "vga",
      width: 0,
      height: 0,
    }),
  })
    .then(handleResponse)
    .then((data: LxdTerminal) => {
      return data;
    });
};

export const connectInstanceConsole = async (
  name: string,
  project: string,
): Promise<LxdTerminal> => {
  return fetch(`/1.0/instances/${name}/console?project=${project}&wait=10`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "wait-for-websocket": true,
      type: "console",
    }),
  })
    .then(handleResponse)
    .then((data: LxdTerminal) => {
      return data;
    });
};

export const fetchInstanceConsoleBuffer = async (
  name: string,
  project: string,
): Promise<string> => {
  return fetch(`/1.0/instances/${name}/console?project=${project}`)
    .then(handleTextResponse)
    .then((data: string) => {
      return data;
    });
};

export const fetchInstanceLogs = async (
  name: string,
  project: string,
): Promise<string[]> => {
  return fetch(`/1.0/instances/${name}/logs?project=${project}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<string[]>) => {
      return data.metadata;
    });
};

export const fetchInstanceLogFile = async (
  name: string,
  project: string,
  file: string,
): Promise<string> => {
  return fetch(`/1.0/instances/${name}/logs/${file}?project=${project}`)
    .then(handleTextResponse)
    .then((data: string) => {
      return data;
    });
};

export const uploadInstance = async (
  file: File | null,
  name: string,
  project: string | undefined,
  pool: string | undefined,
  setUploadState: (value: UploadState) => void,
  uploadController: AbortController,
): Promise<LxdOperationResponse> => {
  return axios
    .post(`/1.0/instances?project=${project}`, file, {
      headers: {
        "Content-Type": "application/octet-stream",
        "X-LXD-name": name,
        "X-LXD-pool": pool,
      },
      onUploadProgress: (event) => {
        setUploadState({
          percentage: event.progress ? Math.floor(event.progress * 100) : 0,
          loaded: event.loaded,
          total: event.total,
        });
      },
      signal: uploadController.signal,
    })
    .then((response: AxiosResponse<LxdOperationResponse>) => response.data);
};

export const createInstanceBackup = async (
  instanceName: string,
  project: string,
  payload: string,
): Promise<LxdOperationResponse> => {
  return fetch(`/1.0/instances/${instanceName}/backups?project=${project}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload,
  })
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};
