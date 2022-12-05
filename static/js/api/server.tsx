import { handleResponse } from "../util/helpers";
import { LxdConfigPair, LxdSettings } from "../types/server";
import { LxdApiResponse } from "../types/apiResponse";

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
