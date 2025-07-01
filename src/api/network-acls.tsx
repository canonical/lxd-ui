import { handleEtagResponse, handleResponse } from "util/helpers";
import type { LxdNetworkAcl } from "types/network";
import type { LxdApiResponse } from "types/apiResponse";
import { addEntitlements } from "util/entitlements/api";

const networkAclEntitlements = ["can_edit", "can_delete"];

export const fetchNetworkAcls = async (
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdNetworkAcl[]> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("recursion", "1");
  addEntitlements(params, isFineGrained, networkAclEntitlements);

  return fetch(`/1.0/network-acls?${params.toString()}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdNetworkAcl[]>) => {
      return data.metadata;
    });
};

export const fetchNetworkAcl = async (
  name: string,
  project: string,
  isFineGrained: boolean | null,
): Promise<LxdNetworkAcl> => {
  const params = new URLSearchParams();
  params.set("project", project);
  params.set("recursion", "1");
  addEntitlements(params, isFineGrained, networkAclEntitlements);

  return fetch(
    `/1.0/network-acls/${encodeURIComponent(name)}?${params.toString()}`,
  )
    .then(handleEtagResponse)
    .then((data) => {
      return data as LxdNetworkAcl;
    });
};

export const createNetworkAcl = async (
  networkAcl: LxdNetworkAcl,
  project: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  await fetch(`/1.0/network-acls?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(networkAcl),
  }).then(handleResponse);
};

export const renameNetworkAcl = async (
  oldName: string,
  newName: string,
  project: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  await fetch(
    `/1.0/network-acls/${encodeURIComponent(oldName)}?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newName,
      }),
    },
  ).then(handleResponse);
};

export const updateNetworkAcl = async (
  networkAcl: LxdNetworkAcl,
  project: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  await fetch(
    `/1.0/network-acls/${encodeURIComponent(networkAcl.name)}?${params.toString()}`,
    {
      method: "PUT",
      body: JSON.stringify(networkAcl),
      headers: {
        "Content-Type": "application/json",
        "If-Match": networkAcl.etag ?? "",
      },
    },
  ).then(handleResponse);
};

export const deleteNetworkAcl = async (
  name: string,
  project: string,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  await fetch(
    `/1.0/network-acls/${encodeURIComponent(name)}?${params.toString()}`,
    {
      method: "DELETE",
    },
  ).then(handleResponse);
};
