import { handleResponse } from "util/helpers";
import type {
  LxdClusterLink,
  LxdClusterLinkCreated,
  LxdClusterLinkState,
} from "types/cluster";
import type { LxdApiResponse } from "types/apiResponse";
import { ROOT_PATH } from "util/rootPath";
import { addEntitlements } from "util/entitlements/api";

const clusterLinkEntitlements = ["can_edit", "can_delete"];

export const fetchClusterLinks = async (
  isFineGrained: boolean | null,
): Promise<LxdClusterLink[]> => {
  const params = new URLSearchParams();
  params.set("recursion", "2");
  addEntitlements(params, isFineGrained, clusterLinkEntitlements);

  return fetch(`${ROOT_PATH}/1.0/cluster/links?${params.toString()}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdClusterLink[]>) => {
      return data.metadata;
    });
};

export const fetchClusterLink = async (
  link: string,
  isFineGrained: boolean | null,
): Promise<LxdClusterLink> => {
  const params = new URLSearchParams();
  params.set("recursion", "2");
  addEntitlements(params, isFineGrained, clusterLinkEntitlements);

  return fetch(
    `${ROOT_PATH}/1.0/cluster/links/${encodeURIComponent(link)}?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdClusterLink>) => {
      return data.metadata;
    });
};

export const fetchClusterLinkState = async (
  link: string,
): Promise<LxdClusterLinkState> => {
  return fetch(
    `${ROOT_PATH}/1.0/cluster/links/${encodeURIComponent(link)}/state`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdClusterLinkState>) => {
      return data.metadata;
    });
};

export const createClusterLink = async (
  body: string,
): Promise<LxdClusterLinkCreated | null> => {
  return fetch(`${ROOT_PATH}/1.0/cluster/links`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  })
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdClusterLinkCreated | null>) => {
      return data.metadata;
    });
};

export const updateClusterLink = async (
  link: string,
  body: string,
): Promise<void> => {
  await fetch(`${ROOT_PATH}/1.0/cluster/links/${encodeURIComponent(link)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  }).then(handleResponse);
};

export const deleteClusterLink = async (link: string): Promise<void> => {
  await fetch(`${ROOT_PATH}/1.0/cluster/links/${encodeURIComponent(link)}`, {
    method: "DELETE",
  }).then(handleResponse);
};
