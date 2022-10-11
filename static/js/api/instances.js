import { watchOperation } from "./operations";

const fetchInstanceState = (instanceName) => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/instances/" + instanceName + "/state")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        resolve(data.metadata);
      })
      .catch(reject);
  });
};

const fetchInstance = (instanceUrl) => {
  return new Promise((resolve, reject) => {
    fetch(instanceUrl)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        fetchInstanceState(data.metadata.name).then((stateDate) => {
          data.metadata.state = stateDate;
          resolve(data.metadata);
        });
      })
      .catch(reject);
  });
};

export const fetchInstances = () => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/instances")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        Promise.allSettled(data.metadata.map(fetchInstance)).then((details) => {
          resolve(details.map((item) => item.value));
        });
      })
      .catch(reject);
  });
};

export const createInstance = (name, imageFingerprint) => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/instances", {
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
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        watchOperation(data.operation).then(resolve);
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
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        watchOperation(data.operation).then(resolve);
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
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        watchOperation(data.operation).then(resolve);
      })
      .catch(reject);
  });
};

export const deleteInstance = (instance) => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/instances/" + instance.name, {
      method: "DELETE",
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        watchOperation(data.operation).then(resolve);
      })
      .catch(reject);
  });
};
