import { handleResponse } from "util/helpers";
import { LxdNetwork } from "types/network";
import { LxdApiResponse } from "types/apiResponse";

export const fetchNetworks = (project: string): Promise<LxdNetwork[]> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks?project=${project}&recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdNetwork[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const fetchNetwork = (
  name: string,
  project: string
): Promise<LxdNetwork> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks/${name}?project=${project}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdNetwork>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const createNetwork = (
  network: Partial<LxdNetwork>,
  project: string
) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks?project=${project}`, {
      method: "POST",
      body: JSON.stringify(network),
    })
      .then(handleResponse)
      .then((data) => resolve(data))
      .catch(reject);
  });
};

export const updateNetwork = (
  network: Partial<LxdNetwork>,
  project: string
) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks/${network.name ?? ""}?project=${project}`, {
      method: "PUT",
      body: JSON.stringify(network),
    })
      .then(handleResponse)
      .then((data) => resolve(data))
      .catch(reject);
  });
};

export const renameNetwork = (
  oldName: string,
  newName: string,
  project: string
) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks/${oldName}?project=${project}`, {
      method: "POST",
      body: JSON.stringify({
        name: newName,
      }),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const deleteNetwork = (name: string, project: string) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks/${name}?project=${project}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then((data) => resolve(data))
      .catch(reject);
  });
};
