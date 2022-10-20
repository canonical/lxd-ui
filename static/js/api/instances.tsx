import { watchOperation } from "./operations";
import { handleResponse } from "../helpers";
import { LxdInstance } from "../types/instance";

export const fetchInstances = (): Promise<LxdInstance[]> => {
  return new Promise((resolve, reject) => {
    return fetch("/1.0/instances?recursion=2")
      .then(handleResponse)
      .then((data) => resolve(data.metadata))
      .catch(reject);
  });
};

export const createInstance = (name: string, imageFingerprint: string) => {
  return new Promise((resolve, reject) => {
    return fetch("/1.0/instances", {
      method: "POST",
      body: JSON.stringify({
        instance: {
          name: name,
        },
        source: {
          fingerprint: imageFingerprint,
          type: "image",
        },
      }),
    })
      .then(handleResponse)
      .then((data) => {
        return watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const startInstance = (instance: LxdInstance) => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/instances/" + instance.name + "/state", {
      method: "PUT",
      body: '{"action": "start"}',
    })
      .then(handleResponse)
      .then((data) => {
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const stopInstance = (instance: LxdInstance) => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/instances/" + instance.name + "/state", {
      method: "PUT",
      body: '{"action": "stop"}',
    })
      .then(handleResponse)
      .then((data) => {
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const deleteInstance = (instance: LxdInstance) => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/instances/" + instance.name, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then((data) => {
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const fetchInstanceConsole = (
  name: string
): Promise<LxdInstanceExec> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${name}/console`, {
      method: "POST",
      body: JSON.stringify({
        height: 24,
        type: "console",
        width: 80,
      }),
    })
      .then(handleResponse)
      .then((data) => resolve(data))
      .catch(reject);
  });
};

type LxdInstanceExec = {
  operation: string;
  metadata: {
    metadata: {
      fds: {
        0: string;
        control: string;
      };
    };
  };
};

export const fetchInstanceExec = (name: string): Promise<LxdInstanceExec> => {
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
      .then((data) => resolve(data))
      .catch(reject);
  });
};
