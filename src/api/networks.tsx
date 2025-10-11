import {
  constructMemberError,
  handleEtagResponse,
  handleResponse,
} from "util/helpers";
import type {
  LxdNetwork,
  LxdNetworkAllocation,
  LxdNetworkConfig,
  LXDNetworkOnClusterMember,
  LxdNetworkState,
} from "types/network";
import type { LxdApiResponse } from "types/apiResponse";
import { areNetworksEqual } from "util/networks";
import type { ClusterSpecificValues } from "components/ClusterSpecificSelect";
import type { LxdClusterMember } from "types/cluster";
import { addEntitlements } from "util/entitlements/api";
import { addTarget } from "util/target";

const networkEntitlements = ["can_edit", "can_delete"];

export const fetchNetworks = async (
  project: string,
  isFineGrained: boolean | null,
  target?: string,
): Promise<LxdNetwork[]> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("recursion", "1");
  addTarget(params, target);
  addEntitlements(params, isFineGrained, networkEntitlements);

  return fetch(`/1.0/networks?${params.toString()}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdNetwork[]>) => {
      const filteredNetworks = data.metadata.filter(
        // Filter out loopback and unknown networks, both are not useful for the user.
        // this is in line with the filtering done in the LXD CLI
        (network) => !["loopback", "unknown"].includes(network.type),
      );
      return filteredNetworks;
    });
};

export const fetchNetworksFromClusterMembers = async (
  project: string,
  clusterMembers: LxdClusterMember[],
  isFineGrained: boolean | null,
): Promise<LXDNetworkOnClusterMember[]> => {
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      clusterMembers.map(async (member) => {
        return fetchNetworks(project, isFineGrained, member.server_name);
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

export const fetchNetwork = async (
  name: string,
  project: string,
  isFineGrained: boolean | null,
  target?: string,
): Promise<LxdNetwork> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, target);
  addEntitlements(params, isFineGrained, networkEntitlements);

  return fetch(`/1.0/networks/${encodeURIComponent(name)}?${params.toString()}`)
    .then(handleEtagResponse)
    .then((data) => {
      return data as LxdNetwork;
    });
};

export const fetchNetworkFromClusterMembers = async (
  name: string,
  project: string,
  clusterMembers: LxdClusterMember[],
  isFineGrained: boolean | null,
): Promise<LXDNetworkOnClusterMember[]> => {
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      clusterMembers.map(async (member) => {
        return fetchNetwork(name, project, isFineGrained, member.server_name);
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

export const fetchNetworkState = async (
  name: string,
  project: string,
  target?: string,
): Promise<LxdNetworkState> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, target);

  return fetch(
    `/1.0/networks/${encodeURIComponent(name)}/state?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdNetworkState>) => {
      return data.metadata;
    });
};

export const createClusterNetwork = async (
  network: Partial<LxdNetwork>,
  project: string,
  clusterMembers: LxdClusterMember[],
  parentsPerClusterMember?: ClusterSpecificValues,
  bridgeExternalInterfacesPerClusterMember?: ClusterSpecificValues,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      clusterMembers.map(async (member) => {
        const memberNetwork = {
          name: network.name,
          type: network.type,
          config: {
            parent: parentsPerClusterMember?.[member.server_name],
            "bridge.external_interfaces":
              bridgeExternalInterfacesPerClusterMember?.[member.server_name],
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

export const createNetwork = async (
  network: Partial<LxdNetwork>,
  project: string,
  target?: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, target);

  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks?${params.toString()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(network),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(async (e: Error) => {
        // when creating a network on localhost the request will get cancelled
        // check manually if creation was successful
        if (e.message === "Failed to fetch") {
          const newNetwork = await fetchNetwork(
            network.name ?? "",
            project,
            false,
            target,
          );
          if (newNetwork) {
            resolve();
          }
        }
        reject(e);
      });
  });
};

export const updateNetwork = async (
  network: LxdNetwork,
  project: string,
  target?: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, target);

  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/networks/${encodeURIComponent(network.name)}?${params.toString()}`,
      {
        method: "PUT",
        body: JSON.stringify(network),
        headers: {
          "Content-Type": "application/json",
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
          const newNetwork = await fetchNetwork(
            network.name ?? "",
            project,
            false,
            target,
          );
          if (areNetworksEqual(network, newNetwork)) {
            resolve();
          }
        }
        reject(e);
      });
  });
};

export const updateClusterNetwork = async (
  network: LxdNetwork,
  project: string,
  clusterMembers: LxdClusterMember[],
  parentsPerClusterMember: ClusterSpecificValues,
  bridgeExternalInterfacesPerClusterMember?: ClusterSpecificValues,
  oldConfig?: LxdNetworkConfig,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      clusterMembers.map(async (member) => {
        const memberName = member.server_name;
        const config: LxdNetworkConfig = { ...oldConfig };
        if (parentsPerClusterMember?.[memberName]) {
          config.parent = parentsPerClusterMember[memberName];
        }
        if (bridgeExternalInterfacesPerClusterMember?.[memberName]) {
          config["bridge.external_interfaces"] =
            bridgeExternalInterfacesPerClusterMember[memberName];
        }
        const memberNetwork = {
          name: network.name,
          type: network.type,
          config,
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

export const renameNetwork = async (
  oldName: string,
  newName: string,
  project: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks/${encodeURIComponent(oldName)}?${params.toString()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
          const renamedNetwork = await fetchNetwork(newName, project, false);
          if (renamedNetwork) {
            resolve();
          }
        }
        reject(e);
      });
  });
};

export const deleteNetwork = async (
  name: string,
  project: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  return new Promise((resolve, reject) => {
    fetch(`/1.0/networks/${encodeURIComponent(name)}?${params.toString()}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then(resolve)
      .catch(async (e: Error) => {
        // when deleting a network on localhost the request will get cancelled
        // check manually if deletion was successful
        if (e.message === "Failed to fetch") {
          const response = await fetch(
            `/1.0/networks/${encodeURIComponent(name)}?project=${encodeURIComponent(project)}`,
          );
          if (response.status === 404) {
            resolve();
          }
        }
        reject(e);
      });
  });
};

export const fetchNetworkAllocations = async (
  project: string,
): Promise<LxdNetworkAllocation[]> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("recursion", "1");

  return fetch(`/1.0/network-allocations?${params.toString()}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdNetworkAllocation[]>) => {
      return data.metadata;
    });
};
