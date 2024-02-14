import { handleResponse, handleTextResponse } from "util/helpers";
import { LxdSettings } from "types/server";
import { LxdApiResponse } from "types/apiResponse";
import { LxdConfigOptions, LxdConfigPair } from "types/config";
import { LxdResources } from "types/resources";

export const fetchSettings = (): Promise<LxdSettings> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0")
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdSettings>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const updateSettings = (config: LxdConfigPair): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0", {
      method: "PATCH",
      body: JSON.stringify({
        config,
      }),
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};

export const fetchResources = (): Promise<LxdResources> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/resources")
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdResources>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const fetchConfigOptions = (
  hasMetadataConfiguration: boolean,
): Promise<LxdConfigOptions | null> => {
  if (!hasMetadataConfiguration) {
    return new Promise((resolve) => resolve(null));
  }

  return new Promise((resolve, reject) => {
    fetch("/1.0/metadata/configuration")
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdConfigOptions>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const fetchDocObjects = (
  hasDocumentationObject: boolean,
): Promise<string[]> => {
  if (!hasDocumentationObject) {
    return new Promise((resolve) => resolve([]));
  }

  return new Promise((resolve, reject) => {
    fetch("/documentation/objects.inv.txt")
      .then(handleTextResponse)
      .then((data) => resolve(data.split("\n")))
      .catch(reject);
  });
};
