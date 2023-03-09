import { handleResponse } from "util/helpers";
import { LxdSettings } from "types/server";
import { LxdApiResponse } from "types/apiResponse";
import { LxdConfigPair } from "types/config";
import { LxdResources } from "types/resources";

export const fetchSettings = (): Promise<LxdSettings> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0")
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdSettings>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const updateSettings = (config: LxdConfigPair) => {
  return new Promise((resolve, reject) => {
    fetch("/1.0", {
      method: "PATCH",
      body: JSON.stringify({
        config,
      }),
    })
      .then(handleResponse)
      .then((data) => resolve(data))
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
