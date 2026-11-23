export interface ProxyAddress {
  type: string;
  address: string;
  port: string;
}

const DEFAULT_PROXY_TYPE = "tcp";

const isBracketed = (address: string): boolean =>
  address.startsWith("[") && address.endsWith("]");

const unwrapIpv6 = (address: string): string =>
  isBracketed(address) ? address.slice(1, -1) : address;

const wrapIpv6 = (address: string): string =>
  address.includes(":") && !isBracketed(address) ? `[${address}]` : address;

const splitAddressAndPort = (
  value: string,
): Pick<ProxyAddress, "address" | "port"> => {
  const closingBracket = value.startsWith("[") ? value.indexOf("]") : -1;
  const separator =
    closingBracket >= 0
      ? value.indexOf(":", closingBracket)
      : value.lastIndexOf(":");

  if (separator < 0) {
    return { address: unwrapIpv6(value), port: "" };
  }

  return {
    address: unwrapIpv6(value.slice(0, separator)),
    port: value.slice(separator + 1),
  };
};

/**
 * Parse a proxy device listen or connect value in the format
 * <type>:<addr>:<port>[-<port>][,<port>] or unix:<path>.
 */
export const parseProxyAddress = (value?: string): ProxyAddress => {
  if (value === undefined) {
    return { type: DEFAULT_PROXY_TYPE, address: "", port: "" };
  }

  const typeSeparator = value.indexOf(":");
  if (typeSeparator < 0) {
    return { type: value, address: "", port: "" };
  }

  const type = value.slice(0, typeSeparator);
  const rest = value.slice(typeSeparator + 1);

  if (type === "unix") {
    return { type, address: rest, port: "" };
  }

  return { type, ...splitAddressAndPort(rest) };
};

export const formatProxyAddress = ({
  type,
  address,
  port,
}: ProxyAddress): string => {
  if (type === "unix") {
    return `${type}:${address}`;
  }
  return `${type}:${wrapIpv6(address)}:${port}`;
};
