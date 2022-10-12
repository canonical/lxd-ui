import { watchOperation } from "./operations";
import { handleResponse } from "../helpers";

const fetchImageDetails = (imageUrl) => {
  return new Promise((resolve, reject) => {
    fetch(imageUrl)
      .then(handleResponse)
      .then((data) => {
        resolve(data.metadata);
      })
      .catch(reject);
  });
};

export const fetchImageList = () => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/images")
      .then(handleResponse)
      .then((data) => {
        Promise.allSettled(data.metadata.map(fetchImageDetails))
          .then((details) => {
            if (details.filter((p) => p.status !== "fulfilled").length > 0) {
              reject('Could not fetch image details.');
            }
            resolve(details.map((item) => item.value));
          })
          .catch(reject);
      })
      .catch(reject);
  });
};

export const deleteImage = (image) => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/images/" + image.fingerprint, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then((data) => {
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};
