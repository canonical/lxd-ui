import { watchOperation } from "./operations";

const fetchImageDetails = (imageUrl) => {
  return new Promise((resolve, reject) => {
    fetch(imageUrl)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        resolve(data.metadata);
      })
      .catch(reject);
  });
};

export const fetchImageList = () => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/images")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        Promise.allSettled(data.metadata.map(fetchImageDetails)).then(
          (details) => {
            resolve(details.map((item) => item.value));
          }
        );
      })
      .catch(reject);
  });
};

export const deleteImage = (image) => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/images/" + image.fingerprint, {
      method: "DELETE",
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        watchOperation(data.operation).then(resolve);
      })
      .catch(reject);
  });
};
