import { handleResponse } from "util/helpers";
import type {
  LxdClusterMember,
  LxdClusterMemberAction,
  LxdClusterMemberAdded,
  LxdClusterMemberState,
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

export const fetchClusterMemberState = async (
  name: string,
): Promise<LxdClusterMemberState> => {
  return fetch(`/1.0/cluster/members/${encodeURIComponent(name)}/state`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdClusterMemberState>) => {
      return data.metadata;
    });
};

export const createClusterMember = async (
  member: string,
): Promise<LxdClusterMemberAdded> => {
  return fetch("/1.0/cluster/members", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: member,
  })
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdOperationResponse>) => {
      return data.metadata.metadata as unknown as LxdClusterMemberAdded;
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
