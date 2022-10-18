import { handleResponse } from "../helpers";
import { LxdWarning } from "../types/warning";

export const fetchWarningList = (): Promise<LxdWarning[]> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/warnings?recursion=2")
      .then(handleResponse)
      .then((data) => resolve(data.metadata))
      .catch(reject);
  });
};
