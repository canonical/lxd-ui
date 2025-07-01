import { handleResponse } from "util/helpers";
import type { LxdOperation, LxdOperationList } from "types/operation";
import type { LxdApiResponse } from "types/apiResponse";

const sortOperationList = (operations: LxdOperationList) => {
  const newestFirst = (a: LxdOperation, b: LxdOperation) => {
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return bTime - aTime;
  };
  operations.failure?.sort(newestFirst);
  operations.success?.sort(newestFirst);
  operations.running?.sort(newestFirst);
};

export const fetchOperations = async (
  project: string | null,
): Promise<LxdOperationList> => {
  const params = new URLSearchParams();
  params.set("recursion", "1");
  if (project) {
    params.append("project", project);
  } else {
    params.append("all-projects", "true");
  }

  return fetch(`/1.0/operations?${params.toString()}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdOperationList>) => {
      sortOperationList(data.metadata);
      return data.metadata;
    });
};

export const cancelOperation = async (id: string): Promise<void> => {
  await fetch(`/1.0/operations/${encodeURIComponent(id)}`, {
    method: "DELETE",
  }).then(handleResponse);
};
