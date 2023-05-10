import { LxdInstance } from "types/instance";

export const getIpAddresses = (
  instance: LxdInstance,
  family: "inet" | "inet6"
) => {
  if (!instance.state?.network) return [];
  return Object.entries(instance.state.network)
    .filter(([key, _value]) => key !== "lo")
    .flatMap(([_key, value]) => value.addresses)
    .filter((item) => item.family === family)
    .map((item) => item.address);
};
