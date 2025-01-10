import { handleEtagResponse, handleResponse } from "util/helpers";
import type {
  LxdNetwork,
  LXDNetworkOnClusterMember,
  LxdNetworkState,
} from "types/network";
import type { LxdApiResponse } from "types/apiResponse";
import { areNetworksEqual } from "util/networks";
import type { ClusterSpecificValues } from "components/ClusterSpecificSelect";
import type { LxdClusterMember } from "types/cluster";

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

const constructMemberError = (
  result: PromiseRejectedResult,
  member: string,
) => {
  const reason = result.reason as Error;
  const message = `Error from cluster member ${member}: ${reason.message}`;
  return new Error(message);
};

export const fetchNetworksFromClusterMembers = (
  project: string,
  clusterMembers: LxdClusterMember[],
): Promise<LXDNetworkOnClusterMember[]> => {
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      clusterMembers.map((member) => {
        return fetchNetworks(project, member.server_name);
      }),
    )
      .then((results) => {
        const networksOnMembers: LXDNetworkOnClusterMember[] = [];
        for (let i = 0; i < clusterMembers.length; i++) {
          const memberName = clusterMembers[i].server_name;
          const result = results[i];
          if (result.status === "rejected") {
            reject(constructMemberError(result, memberName));
          }
          if (result.status === "fulfilled") {
            result.value.forEach((network) =>
              networksOnMembers.push({ ...network, memberName }),
            );
          }
        }
        resolve(networksOnMembers);
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

export const fetchNetworkFromClusterMembers = (
  name: string,
  project: string,
  clusterMembers: LxdClusterMember[],
): Promise<LXDNetworkOnClusterMember[]> => {
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      clusterMembers.map((member) => {
        return fetchNetwork(name, project, member.server_name);
      }),
    )
      .then((results) => {
        const networkOnMembers: LXDNetworkOnClusterMember[] = [];
        for (let i = 0; i < clusterMembers.length; i++) {
          const memberName = clusterMembers[i].server_name;
          const result = results[i];
          if (result.status === "rejected") {
            reject(constructMemberError(result, memberName));
          }
          if (result.status === "fulfilled") {
            const promise = results[i] as PromiseFulfilledResult<LxdNetwork>;
            networkOnMembers.push({ ...promise.value, memberName: memberName });
          }
        }
        resolve(networkOnMembers);
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
  parentsPerClusterMember?: ClusterSpecificValues,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      clusterMembers.map((member) => {
        const memberNetwork = {
          name: network.name,
          type: network.type,
          config: {
            parent: parentsPerClusterMember?.[member.server_name],
          },
        };
        return createNetwork(memberNetwork, project, member.server_name);
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
          "If-Match": network.etag ?? "",
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
  parentsPerClusterMember: ClusterSpecificValues,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      Object.keys(parentsPerClusterMember).map((memberName) => {
        const memberNetwork = {
          name: network.name,
          type: network.type,
          config: {
            parent: parentsPerClusterMember[memberName],
          },
        };
        return updateNetwork(memberNetwork, project, memberName);
      }),
    )
      .then((results) => {
        const error = results.find((res) => res.status === "rejected")
          ?.reason as Error | undefined;

        if (error) {
          reject(error);
          return;
        }
        updateNetwork({ ...network, etag: "" }, project)
          .then(resolve)
          .catch(reject);
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
