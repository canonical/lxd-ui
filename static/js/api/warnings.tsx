import { handleResponse } from "../helpers";

export type LxdWarning = {
  status: string;
  uuid: string;
  project: string;
  type: string;
  count: number;
  first_seen_at: string;
  last_seen_at: string;
  last_message: string;
  severity: string;
};

export const fetchWarningList = (): Promise<LxdWarning[]> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/warnings?recursion=2")
      .then(handleResponse)
      .then((data) => resolve(data.metadata))
      .catch(reject);
  });
};
