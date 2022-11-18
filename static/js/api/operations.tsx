import { handleResponse } from "../util/helpers";

export const watchOperation = (operationUrl: string, timeout: number = 10) => {
  return new Promise((resolve, reject) => {
    fetch(`${operationUrl}/wait?timeout=${timeout}`)
      .then(handleResponse)
      .then((data) => {
        if (data.metadata.status === "Success") {
          return resolve(data);
        }
        if (data.metadata.status === "Running") {
          throw Error(
            "Timeout while waiting for the operation to succeed. Watched operation continues in the background."
          );
        } else {
          throw Error(data.metadata?.err);
        }
      })
      .catch(reject);
  });
};
