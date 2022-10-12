import { handleResponse } from "../helpers";

export const watchOperation = (operationUrl) => {
  return new Promise((resolve, reject) => {
    fetch(operationUrl + "/wait?timeout=10")
      .then(handleResponse)
      .then((data) => {
        if (data.metadata.status === "Success") {
          resolve(data);
        } else {
          throw Error("Operation did not succeed");
        }
      })
      .catch(reject);
  });
};
