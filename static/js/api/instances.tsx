import { watchOperation } from "./operations";
import { handleResponse } from "../util/helpers";
import { LxdInstance } from "../types/instance";
import { LxdConsole } from "../types/console";
import { LxdApiResponse } from "../types/apiResponse";
import { LxdOperation } from "../types/operation";

export const fetchInstance = (instanceName: string): Promise<LxdInstance> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${instanceName}?recursion=2`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdInstance>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const fetchInstances = (): Promise<LxdInstance[]> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/instances?recursion=2")
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdInstance[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const createInstance = (
  name: string,
  imageFingerprint: string,
  instanceType: string
) => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/instances", {
      method: "POST",
      body: JSON.stringify({
        name: name,
        source: {
          fingerprint: imageFingerprint,
          type: "image",
        },
        type: instanceType,
      }),
    })
      .then(handleResponse)
      .then((data: LxdOperation) => {
        watchOperation(data.operation, 120).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const createInstanceFromJson = (instanceConfiguration: string) => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/instances", {
      method: "POST",
      body: instanceConfiguration,
    })
      .then(handleResponse)
      .then((data: LxdOperation) => {
        watchOperation(data.operation, 120).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const startInstance = (instance: LxdInstance) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${instance.name}/state`, {
      method: "PUT",
      body: '{"action": "start"}',
    })
      .then(handleResponse)
      .then((data: LxdOperation) => {
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const stopInstance = (instance: LxdInstance) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${instance.name}/state`, {
      method: "PUT",
      body: '{"action": "stop"}',
    })
      .then(handleResponse)
      .then((data: LxdOperation) => {
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const deleteInstance = (instance: LxdInstance) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${instance.name}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then((data: LxdOperation) => {
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const fetchInstanceExec = (name: string): Promise<LxdConsole> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${name}/exec?wait=10`, {
      method: "POST",
      body: JSON.stringify({
        command: ["bash"],
        "record-output": true,
        "wait-for-websocket": true,
        environment: {
          TERM: "xterm-256color",
        },
        interactive: true,
        group: 1000,
        user: 1000,
      }),
    })
      .then(handleResponse)
      .then((data: LxdConsole) => resolve(data))
      .catch(reject);
  });
};

export const fetchInstanceVga = (name: string): Promise<LxdConsole> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${name}/console?wait=10`, {
      method: "POST",
      body: JSON.stringify({
        type: "vga",
        width: 0,
        height: 0,
      }),
    })
      .then(handleResponse)
      .then((data: LxdConsole) => resolve(data))
      .catch(reject);
  });
};
