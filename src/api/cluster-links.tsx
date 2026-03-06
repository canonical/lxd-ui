import { handleResponse } from "util/helpers";
import type {
  LxdClusterLink,
  LxdClusterLinkCreated,
  LxdClusterLinkState,
} from "types/cluster";
import type { LxdApiResponse } from "types/apiResponse";
import { ROOT_PATH } from "util/rootPath";

export const fetchClusterLinks = async (): Promise<LxdClusterLink[]> => {
  return fetch(`${ROOT_PATH}/1.0/cluster/links?recursion=2`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdClusterLink[]>) => {
      return data.metadata;
    });
};

export const fetchClusterLink = async (
  link: string,
): Promise<LxdClusterLink> => {
  return fetch(
    `${ROOT_PATH}/1.0/cluster/links/${encodeURIComponent(link)}?recursion=2`,
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
): Promise<LxdClusterLinkCreated> => {
  return fetch(`${ROOT_PATH}/1.0/cluster/links`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  })
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdClusterLinkCreated>) => {
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
