import { watchOperation } from "./operations";
import { handleResponse } from "../util/helpers";
import { ImportImage, LxdImage } from "../types/image";
import { LxdApiResponse } from "../types/apiResponse";
import { LxdOperation } from "../types/operation";

export const fetchImageList = (): Promise<LxdImage[]> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/images?recursion=1")
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdImage[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const deleteImage = (image: LxdImage) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/images/${image.fingerprint}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then((data: LxdOperation) => {
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const importImage = (remoteImage: ImportImage) => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/images", {
      method: "POST",
      body: JSON.stringify({
        auto_update: true,
        source: {
          alias: remoteImage.aliases.split(",")[0],
          mode: "pull",
          protocol: "simplestreams",
          type: "image",
          server: remoteImage.server,
        },
      }),
    })
      .then(handleResponse)
      .then((data: LxdOperation) => {
        watchOperation(data.operation, 300).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};
