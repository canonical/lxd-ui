import { handleResponse } from "util/helpers";
import { LxdNetwork, LxdNetworkForward } from "types/network";
import { LxdApiResponse } from "types/apiResponse";

export const fetchNetworkForwards = (
  network: string,
  project: string,
): Promise<LxdNetworkForward[]> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks/${network}/forwards?project=${project}&recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdNetworkForward[]>) =>
        resolve(data.metadata),
      )
      .catch(reject);
  });
};

export const fetchNetworkForward = (
  network: string,
  listenAddress: string,
  project: string,
): Promise<LxdNetworkForward> => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/networks/${network}/forwards/${listenAddress}?project=${project}&recursion=1`,
    )
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdNetworkForward>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const createNetworkForward = (
  network: string,
  forward: Partial<LxdNetworkForward>,
  project: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks/${network}/forwards?project=${project}`, {
      method: "POST",
      body: JSON.stringify(forward),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const updateNetworkForward = (
  network: string,
  forward: Partial<LxdNetworkForward>,
  project: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/networks/${network}/forwards/${forward.listen_address}?project=${project}`,
      {
        method: "PUT",
        body: JSON.stringify(forward),
      },
    )
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const deleteNetworkForward = (
  network: LxdNetwork,
  forward: LxdNetworkForward,
  project: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/networks/${network.name}/forwards/${forward.listen_address}?project=${project}`,
      {
        method: "DELETE",
      },
    )
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};
