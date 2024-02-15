import { LxdSettings } from "types/server";

export const supportsOvnNetwork = (
  settings: LxdSettings | undefined,
): boolean => {
  return Boolean(
    settings?.config?.["network.ovn.northbound_connection"] ?? false,
  );
};

export const isClusteredServer = (
  settings: LxdSettings | undefined,
): boolean => {
  return settings?.environment?.server_clustered ?? false;
};
