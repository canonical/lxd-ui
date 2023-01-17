import { watchOperation } from "./operations";
import { handleResponse } from "util/helpers";
import { LxdInstance } from "types/instance";
import { LxdTerminal, LxdTerminalPayload } from "types/terminal";
import { LxdApiResponse } from "types/apiResponse";
import { LxdOperation } from "types/operation";
import { RemoteImage } from "types/image";

export const fetchInstance = (
  instanceName: string,
  recursion = 2
): Promise<LxdInstance> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${instanceName}?recursion=${recursion}`)
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
  image: RemoteImage,
  instanceType: string,
  profiles: string[]
) => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/instances", {
      method: "POST",
      body: JSON.stringify({
        name: name,
        profiles: profiles,
        source: {
          alias: image.aliases.split(",")[0],
          mode: "pull",
          protocol: "simplestreams",
          server: image.server,
          type: "image",
        },
        type: instanceType,
      }),
    })
      .then(handleResponse)
      .then((data: LxdOperation) => {
        watchOperation(data.operation, 120)
          .then(() => resolve(data))
          .catch(reject);
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

export const updateInstanceFromJson = (instanceConfiguration: string) => {
  const instance = JSON.parse(instanceConfiguration) as LxdInstance;
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${instance.name}`, {
      method: "PUT",
      body: instanceConfiguration,
    })
      .then(handleResponse)
      .then(resolve)
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

export const freezeInstance = (instance: LxdInstance) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${instance.name}/state`, {
      method: "PUT",
      body: '{"action": "freeze"}',
    })
      .then(handleResponse)
      .then((data: LxdOperation) => {
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const unfreezeInstance = (instance: LxdInstance) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${instance.name}/state`, {
      method: "PUT",
      body: '{"action": "unfreeze"}',
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

export const fetchInstanceExec = (
  name: string,
  payload: LxdTerminalPayload
): Promise<LxdTerminal> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${name}/exec?wait=10`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then(handleResponse)
      .then((data: LxdTerminal) => resolve(data))
      .catch(reject);
  });
};

export const fetchInstanceVga = (name: string): Promise<LxdTerminal> => {
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
      .then((data: LxdTerminal) => resolve(data))
      .catch(reject);
  });
};
