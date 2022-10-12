import { watchOperation } from "./operations";
import { handleResponse } from "../helpers";

const fetchInstanceState = (instanceName) => {
  return new Promise((resolve, reject) => {
    return fetch("/1.0/instances/" + instanceName + "/state")
      .then(handleResponse)
      .then((data) => {
        resolve(data.metadata);
      })
      .catch(reject);
  });
};

const fetchInstance = (instanceUrl) => {
  return new Promise((resolve, reject) => {
    return fetch(instanceUrl)
      .then(handleResponse)
      .then((data) => {
        fetchInstanceState(data.metadata.name)
          .then((stateData) => {
            data.metadata.state = stateData;
            resolve(data.metadata);
          })
          .catch(reject);
      })
      .catch(reject);
  });
};

export const fetchInstances = () => {
  return new Promise((resolve, reject) => {
    return fetch("/1.0/instances")
      .then(handleResponse)
      .then((data) => {
        Promise.allSettled(data.metadata.map(fetchInstance))
          .then((details) => {
            if (details.filter((p) => p.status !== "fulfilled").length > 0) {
              reject('Could not fetch image details.');
            }
            resolve(details.map((item) => item.value));
          })
          .catch(reject);
      })
      .catch(reject);
  });
};

export const createInstance = (name, imageFingerprint) => {
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

export const startInstance = (instance) => {
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

export const stopInstance = (instance) => {
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

export const deleteInstance = (instance) => {
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
