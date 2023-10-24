import { handleResponse } from "util/helpers";
import { LxdOperation, LxdOperationList } from "types/operation";
import { LxdApiResponse } from "types/apiResponse";

const sortOperationList = (operations: LxdOperationList) => {
  const newestFirst = (a: LxdOperation, b: LxdOperation) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  };
  operations.failure?.sort(newestFirst);
  operations.success?.sort(newestFirst);
  operations.running?.sort(newestFirst);
};

export const fetchOperations = (project: string): Promise<LxdOperationList> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/operations?project=${project}&recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdOperationList>) => {
        sortOperationList(data.metadata);
        return resolve(data.metadata);
      })
      .catch(reject);
  });
};

export const fetchAllOperations = (): Promise<LxdOperationList> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/operations?all-projects=true&recursion=1`)
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdOperationList>) => {
        sortOperationList(data.metadata);
        return resolve(data.metadata);
      })
      .catch(reject);
  });
};

export const cancelOperation = (id: string): Promise<LxdOperationList> => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/operations/${id}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then(resolve)
      .catch(reject);
  });
};
