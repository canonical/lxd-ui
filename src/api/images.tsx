import { TIMEOUT_300, watchOperation } from "./operations";
import { handleResponse } from "util/helpers";
import { ImportImage, LxdImage } from "types/image";
import { LxdApiResponse } from "types/apiResponse";
import { LxdOperationResponse } from "types/operation";

export const fetchImage = (
  image: string,
  project: string
): Promise<LxdImage> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/images/${image}?project=${project}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdImage>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const fetchImageList = (project: string): Promise<LxdImage[]> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/images?recursion=1&project=${project}`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdImage[]>) => resolve(data.metadata))
      .catch(reject);
  });
};

export const deleteImage = (image: LxdImage, project: string) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/images/${image.fingerprint}?project=${project}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then((data: LxdOperationResponse) => {
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
      .then((data: LxdOperationResponse) => {
        watchOperation(data.operation, TIMEOUT_300).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};
