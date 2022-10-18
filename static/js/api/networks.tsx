import { handleResponse } from "../helpers";

export type LxdNetwork = {
  name: string;
  config: {
    "ipv4.address": string;
    "ipv4.nat": string;
    "ipv6.address": string;
    "ipv6.nat": string;
  };
  description: string;
  locations: null;
  managed: boolean;
  status: string;
  type: string;
  used_by?: string[];
};

export const fetchNetworkList = (): Promise<LxdNetwork[]> => {
  return new Promise((resolve, reject) => {
    fetch("/1.0/networks?recursion=1")
      .then(handleResponse)
      .then((data) => resolve(data.metadata))
      .catch(reject);
  });
};
