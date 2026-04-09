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
import type { ClusterSpecificValues } from "types/cluster";
import type { LxdClusterMember } from "types/cluster";
import { addEntitlements } from "util/entitlements/api";
import { addTarget } from "util/target";
import { ROOT_PATH } from "util/rootPath";
import type { LxdOperationResponse } from "types/operation";
import { waitForOperation } from "api/operations";

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

  return fetch(`${ROOT_PATH}/1.0/networks?${params.toString()}`)
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
            networksOnMembers.push({
              ...result,
              memberName,
              promiseStatus: "rejected",
            });
          }
          if (result.status === "fulfilled") {
            result.value.forEach((network) =>
              networksOnMembers.push({
                ...network,
                memberName,
                promiseStatus: "fulfilled",
              }),
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

  return fetch(
    `${ROOT_PATH}/1.0/networks/${encodeURIComponent(name)}?${params.toString()}`,
  )
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
            networkOnMembers.push({
              ...promise.value,
              memberName: memberName,
              promiseStatus: "fulfilled",
            });
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
    `${ROOT_PATH}/1.0/networks/${encodeURIComponent(name)}/state?${params.toString()}`,
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
  hasStorageAndNetworkOperations: boolean,
  parentsPerClusterMember?: ClusterSpecificValues,
  bridgeExternalInterfacesPerClusterMember?: ClusterSpecificValues,
): Promise<LxdOperationResponse> => {
  const operations = await Promise.allSettled(
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

      const operation = await createNetwork(
        memberNetwork,
        project,
        member.server_name,
      );
      return { operation, member: member.server_name };
    }),
  );

  const pendingOperations = operations.map((res) => {
    if (res.status === "rejected") {
      throw res?.reason as Error;
    }
    return res.value;
  });

  if (hasStorageAndNetworkOperations) {
    await Promise.all(
      pendingOperations.map(async ({ operation, member }) => {
        await waitForOperation(operation.metadata.id, member);
      }),
    );
  }

  // The network parent is cluster member specific, so we omit it on the cluster wide network configuration.
  delete network.config?.parent;
  return createNetwork(network, project);
};

export const createNetwork = async (
  network: Partial<LxdNetwork>,
  project: string,
  target?: string,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, target);

  try {
    const response = await fetch(
      `${ROOT_PATH}/1.0/networks?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(network),
      },
    );

    return (await handleResponse(response)) as LxdOperationResponse;
  } catch (e: unknown) {
    // when creating a network on localhost the request can get canceled
    // check manually if creation was successful
    // wait for 1 second for network creation to complete.
    await new Promise((r) => setTimeout(r, 1000));

    if (e instanceof Error && e.message === "Failed to fetch") {
      const newNetwork = await fetchNetwork(
        network.name ?? "",
        project,
        false,
        target,
      );

      if (newNetwork) {
        // Return a manual success response instead of resolving a void expression
        return {
          operation: "",
          metadata: {
            class: "network",
            created_at: new Date().toISOString(),
            description: "Network created",
            err: "",
            id: "",
            location: "",
            may_cancel: false,
            status: "Success",
            status_code: 200,
            updated_at: new Date().toISOString(),
          },
        } as LxdOperationResponse;
      }
    }

    // Re-throw the error so the caller can catch it
    throw e;
  }
};

export const updateNetwork = async (
  network: LxdNetwork,
  project: string,
  target?: string,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, target);

  try {
    const response = await fetch(
      `${ROOT_PATH}/1.0/networks/${encodeURIComponent(network.name)}?${params.toString()}`,
      {
        method: "PUT",
        body: JSON.stringify(network),
        headers: {
          "Content-Type": "application/json",
          "If-Match": network.etag ?? "",
        },
      },
    );

    return (await handleResponse(response)) as LxdOperationResponse;
  } catch (e: unknown) {
    // when updating a network on localhost the request can get canceled
    // check manually if the edit was successful
    // wait for 1 second for network update to complete.
    await new Promise((r) => setTimeout(r, 1000));

    if (e instanceof Error && e.message === "Failed to fetch") {
      const updatedNetwork = await fetchNetwork(
        network.name,
        project,
        false,
        target,
      );

      if (areNetworksEqual(network, updatedNetwork)) {
        // Return a manual success response to satisfy the return type
        return {
          operation: "",
          metadata: {
            class: "network",
            created_at: new Date().toISOString(),
            description: "Network updated (fallback verification)",
            err: "",
            id: "",
            location: "",
            may_cancel: false,
            status: "Success",
            status_code: 200,
            updated_at: new Date().toISOString(),
          },
        } as LxdOperationResponse;
      }
    }

    // Re-throw the error so the caller handles the failure
    throw e;
  }
};

export const updateClusterNetwork = async (
  network: LxdNetwork,
  project: string,
  clusterMembers: LxdClusterMember[],
  parentsPerClusterMember: ClusterSpecificValues,
  hasStorageAndNetworkOperations: boolean,
  bridgeExternalInterfacesPerClusterMember?: ClusterSpecificValues,
  oldConfig?: LxdNetworkConfig,
): Promise<LxdOperationResponse> => {
  const results = await Promise.allSettled(
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

      const operation = await updateNetwork(memberNetwork, project, memberName);
      return { operation, member: memberName };
    }),
  );

  const pendingOperations = results.map((res) => {
    if (res.status === "rejected") {
      throw res?.reason as Error;
    }
    return res.value;
  });

  if (hasStorageAndNetworkOperations) {
    await Promise.all(
      pendingOperations.map(async ({ operation, member }) => {
        await waitForOperation(operation.metadata.id, member);
      }),
    );
  }

  return updateNetwork({ ...network, etag: "" }, project);
};

export const renameNetwork = async (
  oldName: string,
  newName: string,
  project: string,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", project);

  try {
    const response = await fetch(
      `${ROOT_PATH}/1.0/networks/${encodeURIComponent(oldName)}?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newName,
        }),
      },
    );

    return (await handleResponse(response)) as LxdOperationResponse;
  } catch (e: unknown) {
    // when renaming a network on localhost the request can get canceled
    // check manually if renaming was successful
    // wait for 1 second for network rename to complete.
    await new Promise((r) => setTimeout(r, 1000));

    if (e instanceof Error && e.message === "Failed to fetch") {
      const renamedNetwork = await fetchNetwork(newName, project, false);

      if (renamedNetwork) {
        // Return a manual success response to satisfy the return type
        return {
          operation: "",
          metadata: {
            class: "network",
            created_at: new Date().toISOString(),
            description: `Network renamed from ${oldName} to ${newName} (fallback verification)`,
            err: "",
            id: "",
            location: "",
            may_cancel: false,
            status: "Success",
            status_code: 200,
            updated_at: new Date().toISOString(),
          },
        } as LxdOperationResponse;
      }
    }

    // Re-throw the error so the caller handles the failure
    throw e;
  }
};

export const deleteNetwork = async (
  name: string,
  project: string,
): Promise<LxdOperationResponse> => {
  const params = new URLSearchParams();
  params.set("project", project);

  try {
    const response = await fetch(
      `${ROOT_PATH}/1.0/networks/${encodeURIComponent(name)}?${params.toString()}`,
      {
        method: "DELETE",
      },
    );

    return (await handleResponse(response)) as LxdOperationResponse;
  } catch (e: unknown) {
    // when deleting a network on localhost the request can get canceled
    // check manually if deletion was successful
    // wait for 1 second for network delete to complete.
    await new Promise((r) => setTimeout(r, 1000));

    if (e instanceof Error && e.message === "Failed to fetch") {
      const checkResponse = await fetch(
        `${ROOT_PATH}/1.0/networks/${encodeURIComponent(name)}?project=${encodeURIComponent(project)}`,
      );

      // If the resource is gone (404), the deletion actually succeeded
      if (checkResponse.status === 404) {
        return {
          operation: "",
          metadata: {
            class: "network",
            created_at: new Date().toISOString(),
            description: `Network ${name} deleted (fallback verification)`,
            err: "",
            id: "",
            location: "",
            may_cancel: false,
            status: "Success",
            status_code: 200,
            updated_at: new Date().toISOString(),
          },
        } as LxdOperationResponse;
      }
    }

    // Re-throw the error so the caller handles the actual failure
    throw e;
  }
};

export const fetchNetworkAllocations = async (
  project: string,
): Promise<LxdNetworkAllocation[]> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("recursion", "1");

  return fetch(`${ROOT_PATH}/1.0/network-allocations?${params.toString()}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdNetworkAllocation[]>) => {
      return data.metadata;
    });
};
