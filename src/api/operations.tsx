import { handleResponse } from "util/helpers";
import type { LxdOperation, LxdOperationList } from "types/operation";
import type { LxdApiResponse } from "types/apiResponse";

const sortOperationList = (operations: LxdOperationList) => {
  const newestFirst = (a: LxdOperation, b: LxdOperation) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  };
  operations.failure?.sort(newestFirst);
  operations.success?.sort(newestFirst);
  operations.running?.sort(newestFirst);
};

export const fetchOperations = async (
  project: string | null,
): Promise<LxdOperationList> => {
  const projectParam = project ? `project=${project}` : "all-projects=true";
  return fetch(`/1.0/operations?${projectParam}&recursion=1`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdOperationList>) => {
      sortOperationList(data.metadata);
      return data.metadata;
    });
};

export const cancelOperation = async (id: string): Promise<void> => {
  await fetch(`/1.0/operations/${id}`, {
    method: "DELETE",
  }).then(handleResponse);
};
