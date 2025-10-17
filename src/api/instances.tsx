import {
  handleEtagResponse,
  handleResponse,
  handleTextResponse,
} from "util/helpers";
import type { BulkOperationItem, BulkOperationResult } from "util/promises";
import { continueOrFinish, pushFailure, pushSuccess } from "util/promises";
import type { LxdInstance, LxdInstanceAction } from "types/instance";
import type { LxdTerminal, TerminalConnectPayload } from "types/terminal";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdOperationResponse } from "types/operation";
import type { EventQueue } from "context/eventQueue";
import type { AxiosResponse } from "axios";
import axios from "axios";
import type { UploadState } from "types/storage";
import { addEntitlements } from "util/entitlements/api";
import { addTarget } from "util/target";
import { linkForInstanceDetail } from "util/instances";

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
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("recursion", "2");
  addEntitlements(params, isFineGrained, instanceEntitlements);

  return fetch(
    `/1.0/instances/${encodeURIComponent(name)}?${params.toString()}`,
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
  const params = new URLSearchParams();
  params.set("recursion", "2");
  if (project) {
    params.set("project", project);
  } else {
    params.set("all-projects", "true");
  }
  addEntitlements(params, isFineGrained, instanceEntitlements);

  return fetch(`/1.0/instances?${params.toString()}`)
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
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, target);

  return fetch(`/1.0/instances?${params.toString()}`, {
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
  const params = new URLSearchParams();
  params.set("project", project);

  return fetch(
    `/1.0/instances/${encodeURIComponent(instance.name)}?${params.toString()}`,
    {
      method: "PUT",
      body: JSON.stringify(instance),
      headers: {
        "Content-Type": "application/json",
        "If-Match": instance.etag ?? "invalid-etag",
      },
    },
  )
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
  const params = new URLSearchParams();
  params.set("project", project);

  return fetch(
    `/1.0/instances/${encodeURIComponent(oldName)}?${params.toString()}`,
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

export const migrateInstance = async (
  name: string,
  project: string,
  target?: string,
  pool?: string,
  targetProject?: string,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, target);

  return fetch(
    `/1.0/instances/${encodeURIComponent(name)}?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        migration: true,
        pool,
        project: targetProject,
      }),
    },
  )
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
  const params = new URLSearchParams();
  params.set("project", project);

  return fetch(
    `/1.0/instances/${encodeURIComponent(instance)}/state?${params.toString()}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: action,
        force: isForce,
      }),
    },
  )
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
): Promise<BulkOperationResult[]> => {
  const results: BulkOperationResult[] = [];
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      actions.map(async ({ name, project, action }) => {
        const item: BulkOperationItem = {
          name,
          type: "instance",
          href: linkForInstanceDetail(project, name),
        };
        await putInstanceAction(name, project, action, isForce)
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
                continueOrFinish(results, actions.length, resolve);
              },
            );
          })
          .catch((e) => {
            pushFailure(results, e instanceof Error ? e.message : "", item);
            continueOrFinish(results, actions.length, resolve);
          });
      }),
    ).catch(reject);
  });
};

export const deleteInstance = async (
  instance: LxdInstance,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", instance.project);

  return fetch(
    `/1.0/instances/${encodeURIComponent(instance.name)}?${params.toString()}`,
    {
      method: "DELETE",
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const deleteInstanceBulk = async (
  instances: LxdInstance[],
  eventQueue: EventQueue,
): Promise<BulkOperationResult[]> => {
  const results: BulkOperationResult[] = [];
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      instances.map(async (instance) => {
        const item: BulkOperationItem = {
          name: instance.name,
          type: "instance",
          href: linkForInstanceDetail(instance.name, instance.project),
        };
        await deleteInstance(instance)
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
                continueOrFinish(results, instances.length, resolve);
              },
            );
          })
          .catch((e) => {
            pushFailure(results, e instanceof Error ? e.message : "", item);
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
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("wait", "10");

  return fetch(
    `/1.0/instances/${encodeURIComponent(name)}/exec?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        command: payload.command.split(" "),
        "wait-for-websocket": true,
        environment: payload.environment.reduce(
          (a, v) => ({ ...a, [v.key]: v.value }),
          {},
        ),
        interactive: true,
        group: payload.group,
        user: payload.user,
      }),
    },
  )
    .then(handleResponse)
    .then((data: LxdTerminal) => {
      return data;
    });
};

export const connectInstanceVga = async (
  name: string,
  project: string,
): Promise<LxdTerminal> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("wait", "10");

  return fetch(
    `/1.0/instances/${encodeURIComponent(name)}/console?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "vga",
        width: 0,
        height: 0,
      }),
    },
  )
    .then(handleResponse)
    .then((data: LxdTerminal) => {
      return data;
    });
};

export const connectInstanceConsole = async (
  name: string,
  project: string,
): Promise<LxdTerminal> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("wait", "10");

  return fetch(
    `/1.0/instances/${encodeURIComponent(name)}/console?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "wait-for-websocket": true,
        type: "console",
      }),
    },
  )
    .then(handleResponse)
    .then((data: LxdTerminal) => {
      return data;
    });
};

export const fetchInstanceConsoleBuffer = async (
  name: string,
  project: string,
): Promise<string> => {
  const params = new URLSearchParams();
  params.set("project", project);

  return fetch(
    `/1.0/instances/${encodeURIComponent(name)}/console?${params.toString()}`,
  )
    .then(handleTextResponse)
    .then((data: string) => {
      return data;
    });
};

export const fetchInstanceLogs = async (
  name: string,
  project: string,
): Promise<string[]> => {
  const params = new URLSearchParams();
  params.set("project", project);

  return fetch(
    `/1.0/instances/${encodeURIComponent(name)}/logs?${params.toString()}`,
  )
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
  const params = new URLSearchParams();
  params.set("project", project);

  return fetch(
    `/1.0/instances/${encodeURIComponent(name)}/logs/${encodeURIComponent(file)}?${params.toString()}`,
  )
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
  const params = new URLSearchParams();
  if (project) {
    params.set("project", project);
  }

  return axios
    .post(`/1.0/instances?${params.toString()}`, file, {
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
  const params = new URLSearchParams();
  params.set("project", project);

  return fetch(
    `/1.0/instances/${encodeURIComponent(instanceName)}/backups?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};
