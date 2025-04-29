import { handleResponse } from "util/helpers";
import type { LxdWarning } from "types/warning";
import type { LxdApiResponse } from "types/apiResponse";

export const fetchWarnings = async (): Promise<LxdWarning[]> => {
  return fetch("/1.0/warnings?recursion=1")
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdWarning[]>) => {
      return data.metadata;
    });
};
