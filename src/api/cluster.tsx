import { handleResponse } from "util/helpers";
import type { LxdApiResponse } from "types/apiResponse";
import type { LxdOperationResponse } from "types/operation";
import { ROOT_PATH } from "util/rootPath";

export const updateCluster = async (
  payload: string,
): Promise<LxdOperationResponse> => {
  return fetch(`${ROOT_PATH}/1.0/cluster`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload,
  })
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdOperationResponse>) => {
      return data.metadata;
    });
};
