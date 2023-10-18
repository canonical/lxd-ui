import { handleEtagResponse, handleResponse } from "util/helpers";
import { LxdNetwork, LxdNetworkState } from "types/network";
import { LxdApiResponse } from "types/apiResponse";
import { LxdClusterMember } from "types/cluster";

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
) => {
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
) => {
  return new Promise((resolve, reject) => {
    const targetParam = target ? `&target=${target}` : "";
    fetch(`/1.0/networks?project=${project}${targetParam}`, {
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
  project: string,
) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks/${network.name ?? ""}?project=${project}`, {
      method: "PUT",
      body: JSON.stringify(network),
      headers: {
        "If-Match": network.etag ?? "invalid-etag",
      },
    })
      .then(handleResponse)
      .then((data) => resolve(data))
      .catch(reject);
  });
};

export const renameNetwork = (
  oldName: string,
  newName: string,
  project: string,
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
