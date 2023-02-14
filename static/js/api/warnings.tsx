import { handleResponse } from "util/helpers";
import { LxdWarning } from "types/warning";
import { LxdApiResponse } from "types/apiResponse";

export const fetchWarnings = (): Promise<LxdWarning[]> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/warnings?recursion=1")
      .then(handleResponse)
      .then((data: LxdApiResponse<LxdWarning[]>) => resolve(data.metadata))
      .catch(reject);
  });
};
