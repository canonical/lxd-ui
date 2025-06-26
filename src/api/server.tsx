import {
  constructMemberError,
  handleResponse,
  handleTextResponse,
} from "util/helpers";
import type { LXDSettingOnClusterMember, LxdSettings } from "types/server";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdMetadata, LxdConfigPair } from "types/config";
import type { LxdResources } from "types/resources";
import type { LxdClusterMember } from "types/cluster";
import type { ClusterSpecificValues } from "components/ClusterSpecificSelect";

export const fetchSettings = async (target?: string): Promise<LxdSettings> => {
  const targetQueryParam = target ? `?target=${target}` : "";
  return fetch(`/1.0${targetQueryParam}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdSettings>) => {
      return data.metadata;
    });
};

export const fetchSettingsFromClusterMembers = async (
  clusterMembers: LxdClusterMember[],
): Promise<LXDSettingOnClusterMember[]> => {
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      clusterMembers.map(async (member) => {
        return fetchSettings(member.server_name);
      }),
    )
      .then((results) => {
        const settingOnMembers: LXDSettingOnClusterMember[] = [];
        for (let i = 0; i < clusterMembers.length; i++) {
          const memberName = clusterMembers[i].server_name;
          const result = results[i];
          if (result.status === "rejected") {
            reject(constructMemberError(result, memberName));
          }
          if (result.status === "fulfilled") {
            const promise = results[
              i
            ] as PromiseFulfilledResult<LXDSettingOnClusterMember>;
            settingOnMembers.push({ ...promise.value, memberName: memberName });
          }
        }
        resolve(settingOnMembers);
      })
      .catch(reject);
  });
};

export const updateSettings = async (
  config: LxdConfigPair,
  target?: string,
): Promise<void> => {
  const targetQueryParam = target ? `?target=${target}` : "";
  await fetch(`/1.0${targetQueryParam}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      config,
    }),
  }).then(handleResponse);
};

export const updateClusteredSettings = async (
  clusterValues: ClusterSpecificValues,
  configName: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    Promise.allSettled(
      Object.keys(clusterValues).map(async (memberName) => {
        const config = {
          [configName]: clusterValues[memberName],
        };
        return updateSettings(config, memberName);
      }),
    )
      .then((results) => {
        const error = results.find((res) => res.status === "rejected")
          ?.reason as Error | undefined;

        if (error) {
          reject(error);
          return;
        }
      })
      .then(resolve)
      .catch(reject);
  });
};

export const fetchResources = async (): Promise<LxdResources> => {
  return fetch("/1.0/resources")
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdResources>) => {
      return data.metadata;
    });
};

export const fetchConfigOptions = async (
  hasMetadataConfiguration: boolean,
): Promise<LxdMetadata | null> => {
  if (!hasMetadataConfiguration) {
    return null;
  }

  return fetch("/1.0/metadata/configuration")
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdMetadata>) => {
      return data.metadata;
    });
};

export const fetchDocObjects = async (
  hasDocumentationObject: boolean,
): Promise<string[]> => {
  if (!hasDocumentationObject) {
    return [];
  }

  return fetch("/documentation/objects.inv.txt")
    .then(handleTextResponse)
    .then((data) => {
      return data.split("\n");
    });
};
