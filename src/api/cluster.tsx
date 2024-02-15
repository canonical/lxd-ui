import { handleResponse } from "util/helpers";
import {
  LxdClusterGroup,
  LxdClusterMember,
  LxdClusterMemberAction,
} from "types/cluster";
import { LxdApiResponse } from "types/apiResponse";

export const fetchClusterMembers = (): Promise<LxdClusterMember[]> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/cluster/members?recursion=2")
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdClusterMember[]>) =>
        resolve(data.metadata),
      )
      .catch(reject);
  });
};

export const postClusterMemberState = (
  member: LxdClusterMember,
  action: LxdClusterMemberAction,
): Promise<LxdClusterMember[]> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/cluster/members/${member.server_name}/state`, {
      method: "POST",
      body: JSON.stringify({
        action: action,
        mode: "start",
      }),
    })
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdClusterMember[]>) =>
        resolve(data.metadata),
      )
      .catch(reject);
  });
};

export const fetchClusterGroups = (): Promise<LxdClusterGroup[]> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/cluster/groups?recursion=1")
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdClusterGroup[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const fetchClusterGroup = (group: string): Promise<LxdClusterGroup> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/cluster/groups/${group}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdClusterGroup>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const updateClusterGroup = (
  group: LxdClusterGroup,
): Promise<LxdApiResponse<null>> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/cluster/groups/${group.name}`, {
      method: "PUT",
      body: JSON.stringify(group),
    })
      .then(handleResponse)
      .then((data: LxdApiResponse<null>) => resolve(data))
      .catch(reject);
  });
};

export const createClusterGroup = (
  group: LxdClusterGroup,
): Promise<LxdApiResponse<null>> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/cluster/groups`, {
      method: "POST",
      body: JSON.stringify(group),
    })
      .then(handleResponse)
      .then((data: LxdApiResponse<null>) => resolve(data))
      .catch(reject);
  });
};

export const deleteClusterGroup = (group: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/cluster/groups/${group}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};
