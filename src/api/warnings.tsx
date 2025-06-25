import { handleResponse, handleSettledResult } from "util/helpers";
import type { LxdWarning } from "types/warning";
import type { LxdApiResponse } from "types/apiResponse";

export const fetchWarnings = async (): Promise<LxdWarning[]> => {
  return fetch(`/1.0/warnings?recursion=1`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdWarning[]>) => {
      return data.metadata;
    });
};

export const deleteWarning = async (warningId: string): Promise<unknown> => {
  return fetch(`/1.0/warnings/${encodeURIComponent(warningId)}`, {
    method: "DELETE",
  }).then(handleResponse);
};

export const deleteWarningBulk = async (
  warningIds: string[],
): Promise<void> => {
  return Promise.allSettled(
    warningIds.map(async (warningId) => deleteWarning(warningId)),
  ).then(handleSettledResult);
};
