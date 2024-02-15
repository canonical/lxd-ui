import { handleEtagResponse, handleResponse } from "util/helpers";
import { LxdNetwork, LxdNetworkState } from "types/network";
import { LxdApiResponse } from "types/apiResponse";
import { LxdClusterMember } from "types/cluster";
import { areNetworksEqual } from "util/networks";

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
  project: string,
): Promise<LxdNetwork> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks/${name}?project=${project}`)
      .then(handleEtagResponse)
      .then((data) => resolve(data as LxdNetwork))
      .catch(reject);
  });
};

export const fetchNetworkState = (
  name: string,
  project: string,
): Promise<LxdNetworkState> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks/${name}/state?project=${project}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdNetworkState>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const createClusterBridge = (
  network: Partial<LxdNetwork>,
  project: string,
  clusterMembers: LxdClusterMember[],
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const memberNetwork = {
      name: network.name,
      description: network.description,
      type: network.type,
    };

    void Promise.allSettled(
      clusterMembers.map(async (member) => {
        await createNetwork(memberNetwork, project, member.server_name);
      }),
    )
      .then((results) => {
        const error = (
          results.find((res) => res.status === "rejected") as
            | PromiseRejectedResult
            | undefined
        )?.reason as Error | undefined;

        if (error) {
          reject(error);
          return;
        }
        createNetwork(network, project).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const createNetwork = (
  network: Partial<LxdNetwork>,
  project: string,
  target?: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const targetParam = target ? `&target=${target}` : "";
    fetch(`/1.0/networks?project=${project}${targetParam}`, {
      method: "POST",
      body: JSON.stringify(network),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(async (e: Error) => {
        // when creating a network on localhost the request will get cancelled
        // check manually if creation was successful
        if (e.message === "Failed to fetch") {
          const newNetwork = await fetchNetwork(network.name ?? "", project);
          if (newNetwork) {
            resolve();
          }
        }
        reject(e);
      });
  });
};

export const updateNetwork = (
  network: Partial<LxdNetwork> & Required<Pick<LxdNetwork, "config">>,
  project: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks/${network.name ?? ""}?project=${project}`, {
      method: "PUT",
      body: JSON.stringify(network),
      headers: {
        "If-Match": network.etag ?? "invalid-etag",
      },
    })
      .then(handleResponse)
      .then(resolve)
      .catch(async (e: Error) => {
        // when updating a network on localhost the request will get cancelled
        // check manually if the edit was successful
        if (e.message === "Failed to fetch") {
          const newNetwork = await fetchNetwork(network.name ?? "", project);
          if (areNetworksEqual(network, newNetwork)) {
            resolve();
          }
        }
        reject(e);
      });
  });
};

export const renameNetwork = (
  oldName: string,
  newName: string,
  project: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks/${oldName}?project=${project}`, {
      method: "POST",
      body: JSON.stringify({
        name: newName,
      }),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(async (e: Error) => {
        // when renaming a network on localhost the request will get cancelled
        // check manually if renaming was successful
        if (e.message === "Failed to fetch") {
          const renamedNetwork = await fetchNetwork(newName, project);
          if (renamedNetwork) {
            resolve();
          }
        }
        reject(e);
      });
  });
};

export const deleteNetwork = (name: string, project: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks/${name}?project=${project}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then(resolve)
      .catch(async (e: Error) => {
        // when deleting a network on localhost the request will get cancelled
        // check manually if deletion was successful
        if (e.message === "Failed to fetch") {
          const response = await fetch(
            `/1.0/networks/${name}?project=${project}`,
          );
          if (response.status === 404) {
            resolve();
          }
        }
        reject(e);
      });
  });
};
