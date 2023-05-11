import { handleResponse } from "util/helpers";
import { LxdOperation } from "types/operation";

export const TIMEOUT_300 = 300;
export const TIMEOUT_120 = 120;
export const TIMEOUT_60 = 60;
export const TIMEOUT_10 = 10;

export const watchOperation = (
  operationUrl: string,
  timeout = TIMEOUT_10
): Promise<LxdOperation> => {
  return new Promise((resolve, reject) => {
    const operationParts = operationUrl.split("?");
    const baseUrl = operationParts[0];
    const queryString = operationParts.length === 1 ? "" : operationParts[1];
    fetch(`${baseUrl}/wait?timeout=${timeout}&${queryString}`)
      .then(handleResponse)
      .then((data: LxdOperation) => {
        if (data.metadata.status === "Success") {
          return resolve(data);
        }
        if (data.metadata.status === "Running") {
          throw Error(
            "Timeout while waiting for the operation to succeed. Watched operation continues in the background."
          );
        } else {
          throw Error(data.metadata.err);
        }
      })
      .catch(reject);
  });
};
