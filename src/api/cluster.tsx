import { handleResponse } from "util/helpers";
import type {
  LxdClusterGroup,
  LxdClusterLink,
  LxdClusterLinkCreateResponse,
  LxdClusterMember,
  LxdClusterMemberAction,
  LxdClusterMemberCreateResponse,
} from "types/cluster";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdOperationResponse } from "types/operation";

export const fetchClusterMembers = async (): Promise<LxdClusterMember[]> => {
  return fetch("/1.0/cluster/members?recursion=2")
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdClusterMember[]>) => {
      return data.metadata;
    });
};

export const fetchClusterMember = async (
  name: string,
): Promise<LxdClusterMember> => {
  return fetch(`/1.0/cluster/members/${encodeURIComponent(name)}?recursion=2`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdClusterMember>) => {
      return data.metadata;
    });
};

export const createClusterMember = async (
  member: LxdClusterMember,
): Promise<LxdClusterMemberCreateResponse> => {
  return fetch("/1.0/cluster/members", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(member),
  })
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdOperationResponse>) => {
      return data.metadata
        .metadata as unknown as LxdClusterMemberCreateResponse;
    });
};

export const updateClusterMember = async (
  member: LxdClusterMember,
): Promise<LxdOperationResponse> => {
  return fetch(
    `/1.0/cluster/members/${encodeURIComponent(member.server_name)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(member),
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const updateCluster = async (
  payload: string,
): Promise<LxdOperationResponse> => {
  return fetch("/1.0/cluster", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload,
  })
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdOperationResponse>) => {
      return data.metadata;
    });
};

export const postClusterMemberState = async (
  member: LxdClusterMember,
  action: LxdClusterMemberAction,
  mode?: string,
): Promise<LxdOperationResponse> => {
  return fetch(
    `/1.0/cluster/members/${encodeURIComponent(member.server_name)}/state`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: action,
        mode: mode !== "" ? mode : undefined,
      }),
    },
  )
    .then(handleResponse)
    .then((data: LxdOperationResponse) => {
      return data;
    });
};

export const fetchClusterGroups = async (): Promise<LxdClusterGroup[]> => {
  return fetch("/1.0/cluster/groups?recursion=1")
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdClusterGroup[]>) => {
      return data.metadata;
    });
};

export const fetchClusterGroup = async (
  group: string,
): Promise<LxdClusterGroup> => {
  return fetch(`/1.0/cluster/groups/${encodeURIComponent(group)}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdClusterGroup>) => {
      return data.metadata;
    });
};

export const updateClusterGroup = async (
  group: LxdClusterGroup,
): Promise<void> => {
  await fetch(`/1.0/cluster/groups/${encodeURIComponent(group.name)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(group),
  }).then(handleResponse);
};

export const createClusterGroup = async (
  group: LxdClusterGroup,
): Promise<void> => {
  await fetch(`/1.0/cluster/groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(group),
  }).then(handleResponse);
};

export const deleteClusterGroup = async (group: string): Promise<void> => {
  await fetch(`/1.0/cluster/groups/${encodeURIComponent(group)}`, {
    method: "DELETE",
  }).then(handleResponse);
};

export const fetchClusterLinks = async (): Promise<LxdClusterLink[]> => {
  return fetch("/1.0/cluster/links?recursion=2")
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdClusterLink[]>) => {
      return data.metadata;
    });
};

export const createClusterLink = async (
  body: string,
): Promise<LxdClusterLinkCreateResponse> => {
  return fetch(`/1.0/cluster/links`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  })
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdClusterLinkCreateResponse>) => {
      return data.metadata;
    });
};

export const deleteClusterLink = async (group: string): Promise<void> => {
  await fetch(`/1.0/cluster/links/${encodeURIComponent(group)}`, {
    method: "DELETE",
  }).then(handleResponse);
};
