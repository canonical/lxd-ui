import { handleEtagResponse, handleResponse } from "util/helpers";
import type { LxdNetwork, LxdNetworkState } from "types/network";
import type { LxdApiResponse } from "types/apiResponse";
import { areNetworksEqual } from "util/networks";
import { ClusterSpecificSelectField } from "components/ClusterSpecificSelect";
import { LxdClusterMember } from "types/cluster";

export const fetchNetworks = (
  project: string,
  target?: string,
): Promise<LxdNetwork[]> => {
  const targetParam = target ? `&target=${target}` : "";
  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks?project=${project}&recursion=1${targetParam}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdNetwork[]>) => {
        const filteredNetworks = data.metadata.filter(
          // Filter out loopback and unknown networks, both are not useful for the user.
          // this is in line with the filtering done in the LXD CLI
          (network) => !["loopback", "unknown"].includes(network.type),
        );
        resolve(filteredNetworks);
      })
      .catch(reject);
  });
};

export type LXDClusterMemberNetworks = {
  memberName: string;
  memberNetworks: LxdNetwork[];
}[];

export const fetchClusterMemberNetworks = async (
  project: string,
  clusterMembers: LxdClusterMember[],
): Promise<LXDClusterMemberNetworks> => {
  return new Promise((resolve, reject) => {
    void Promise.allSettled(
      clusterMembers.map(async (member) => {
        return await fetchNetworks(project, member.server_name);
      }),
    )
      .then((results) => {
        const error = results.find((res) => res.status === "rejected")
          ?.reason as Error | undefined;

        if (error) {
          reject(error);
          return;
        }

        const result: LXDClusterMemberNetworks = [];

        for (let i = 0; i < clusterMembers.length; i++) {
          const memberName = clusterMembers[i].server_name;
          const networks = results[i] as PromiseFulfilledResult<LxdNetwork[]>;
          result.push({ memberName, memberNetworks: networks.value });
        }

        resolve(result);
      })
      .catch(reject);
  });
};

export const fetchNetwork = (
  name: string,
  project: string,
  target?: string,
): Promise<LxdNetwork> => {
  const targetParam = target ? `&target=${target}` : "";
  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks/${name}?project=${project}${targetParam}`)
      .then(handleEtagResponse)
      .then((data) => resolve(data as LxdNetwork))
      .catch(reject);
  });
};

export type LXDClusterMemberNetwork = {
  memberName: string;
  network: LxdNetwork;
}[];

export const fetchClusterMemberNetwork = async (
  name: string,
  project: string,
  clusterMembers: LxdClusterMember[],
): Promise<LXDClusterMemberNetwork> => {
  return new Promise((resolve, reject) => {
    void Promise.allSettled(
      clusterMembers.map(async (member) => {
        return await fetchNetwork(name, project, member.server_name);
      }),
    )
      .then((results) => {
        const error = results.find((res) => res.status === "rejected")
          ?.reason as Error | undefined;

        if (error) {
          reject(error);
          return;
        }

        const result: LXDClusterMemberNetwork = [];

        for (let i = 0; i < clusterMembers.length; i++) {
          const name = clusterMembers[i].server_name;
          const promise = results[i] as PromiseFulfilledResult<LxdNetwork>;
          result.push({ memberName: name, network: promise.value });
        }

        resolve(result);
      })
      .catch(reject);
  });
};

export const fetchNetworkState = (
  name: string,
  project: string,
  target?: string,
): Promise<LxdNetworkState> => {
  const targetParam = target ? `&target=${target}` : "";
  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks/${name}/state?project=${project}${targetParam}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdNetworkState>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const createClusterNetwork = (
  network: Partial<LxdNetwork>,
  project: string,
  clusterMembers: LxdClusterMember[],
  parentsPerClusterMember?: ClusterSpecificSelectField,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    void Promise.allSettled(
      clusterMembers.map(async (member) => {
        const memberNetwork = {
          name: network.name,
          type: network.type,
          config: {
            parent: parentsPerClusterMember?.[member.server_name],
          },
        };
        await createNetwork(memberNetwork, project, member.server_name);
      }),
    )
      .then((results) => {
        const error = results.find((res) => res.status === "rejected")
          ?.reason as Error | undefined;

        if (error) {
          reject(error);
          return;
        }
        // The network parent is cluster member specific, so we omit it on the cluster wide network configuration.
        delete network.config?.parent;
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
  target?: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const targetParam = target ? `&target=${target}` : "";
    fetch(
      `/1.0/networks/${network.name ?? ""}?project=${project}${targetParam}`,
      {
        method: "PUT",
        body: JSON.stringify(network),
        headers: {
          "If-Match": network.etag ?? "invalid-etag",
        },
      },
    )
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

export const updateClusterNetwork = (
  network: Partial<LxdNetwork> & Required<Pick<LxdNetwork, "config">>,
  project: string,
  parentsPerClusterMember?: ClusterSpecificSelectField,
  networkByMembers?: LXDClusterMemberNetwork,
): Promise<void> => {
  if (!parentsPerClusterMember) {
    return updateNetwork(network, project);
  }

  return new Promise((resolve, reject) => {
    void Promise.allSettled(
      Object.keys(parentsPerClusterMember).map(async (memberName) => {
        const memberNetwork = {
          name: network.name,
          type: network.type,
          config: {
            parent: parentsPerClusterMember[memberName],
          },
          etag: networkByMembers?.find((item) => item.memberName === memberName)
            ?.network.etag,
        };
        await updateNetwork(memberNetwork, project, memberName);
      }),
    )
      .then((results) => {
        const error = results.find((res) => res.status === "rejected")
          ?.reason as Error | undefined;

        if (error) {
          reject(error);
          return;
        }
        updateNetwork(network, project).then(resolve).catch(reject);
      })
      .catch(reject);
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
