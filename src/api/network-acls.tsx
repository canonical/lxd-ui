import { handleEtagResponse, handleResponse } from "util/helpers";
import type { LxdNetworkAcl } from "types/network";
import type { LxdApiResponse } from "types/apiResponse";
import { withEntitlementsQuery } from "util/entitlements/api";

const networkAclEntitlements = ["can_edit", "can_delete"];

export const fetchNetworkAcls = async (
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdNetworkAcl[]> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    networkAclEntitlements,
  );
  return new Promise((resolve, reject) => {
    fetch(`/1.0/network-acls?project=${project}&recursion=1${entitlements}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdNetworkAcl[]>) => {
        resolve(data.metadata);
      })
      .catch(reject);
  });
};

export const fetchNetworkAcl = async (
  name: string,
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdNetworkAcl> => {
  const entitlements = withEntitlementsQuery(
    isFineGrained,
    networkAclEntitlements,
  );
  return new Promise((resolve, reject) => {
    fetch(
      `/1.0/network-acls/${name}?project=${project}&recursion=1${entitlements}`,
    )
      .then(handleEtagResponse)
      .then((data) => {
        resolve(data as LxdNetworkAcl);
      })
      .catch(reject);
  });
};

export const createNetworkAcl = async (
  networkAcl: LxdNetworkAcl,
  project: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/network-acls?project=${project}`, {
      method: "POST",
      body: JSON.stringify(networkAcl),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const renameNetworkAcl = async (
  oldName: string,
  newName: string,
  project: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/network-acls/${oldName}?project=${project}`, {
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

export const updateNetworkAcl = async (
  networkAcl: LxdNetworkAcl,
  project: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/network-acls/${networkAcl.name}?project=${project}`, {
      method: "PUT",
      body: JSON.stringify(networkAcl),
      headers: {
        "If-Match": networkAcl.etag ?? "",
      },
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const deleteNetworkAcl = async (
  name: string,
  project: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/network-acls/${name}?project=${project}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};
