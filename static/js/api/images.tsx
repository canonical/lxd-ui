import { watchOperation } from "./operations";
import { handleResponse } from "../helpers";
import { LxdImage } from "../types/image";

export const fetchImageList = (): Promise<LxdImage[]> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/images?recursion=1")
      .then(handleResponse)
      .then((data) => resolve(data.metadata))
      .catch(reject);
  });
};

export const deleteImage = (image: LxdImage) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/images/${image.fingerprint}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then((data) => {
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};
