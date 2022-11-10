import { handleResponse } from "../util/helpers";

export const watchOperation = (operationUrl: string, timeout: number = 10) => {
  return new Promise((resolve, reject) => {
    fetch(`${operationUrl}/wait?timeout=${timeout}`)
      .then(handleResponse)
      .then((data) => {
        if (data.metadata.status === "Success") {
          resolve(data);
        } else {
          throw Error(data.metadata?.err);
        }
      })
      .catch(reject);
  });
};
