import { formatProxyAddress, parseProxyAddress } from "util/proxyAddress";

describe("parseProxyAddress", () => {
  it("defaults to tcp for an undefined value", () => {
    expect(parseProxyAddress(undefined)).toEqual({
      type: "tcp",
      address: "",
      port: "",
    });
  });

  it("parses an IPv4 address", () => {
    expect(parseProxyAddress("tcp:127.0.0.1:80")).toEqual({
      type: "tcp",
      address: "127.0.0.1",
      port: "80",
    });
  });

  it("strips the brackets from an IPv6 address", () => {
    expect(parseProxyAddress("tcp:[::1]:80")).toEqual({
      type: "tcp",
      address: "::1",
      port: "80",
    });
  });

  it("parses an IPv6 address with a port range", () => {
    expect(parseProxyAddress("udp:[2001:db8::5]:8080-8090,9000")).toEqual({
      type: "udp",
      address: "2001:db8::5",
      port: "8080-8090,9000",
    });
  });

  it("parses an IPv6 address without a port", () => {
    expect(parseProxyAddress("tcp:[::]")).toEqual({
      type: "tcp",
      address: "::",
      port: "",
    });
  });

  it("keeps an unclosed bracket intact", () => {
    expect(parseProxyAddress("tcp:[2001:db8:80")).toEqual({
      type: "tcp",
      address: "[2001:db8",
      port: "80",
    });
  });

  it("parses an empty address", () => {
    expect(parseProxyAddress("tcp::80")).toEqual({
      type: "tcp",
      address: "",
      port: "80",
    });
  });

  it("keeps colons in unix socket paths", () => {
    expect(parseProxyAddress("unix:/run/my:socket")).toEqual({
      type: "unix",
      address: "/run/my:socket",
      port: "",
    });
  });
});

describe("formatProxyAddress", () => {
  it("formats an IPv4 address", () => {
    expect(
      formatProxyAddress({ type: "tcp", address: "127.0.0.1", port: "80" }),
    ).toBe("tcp:127.0.0.1:80");
  });

  it("wraps an IPv6 address in brackets", () => {
    expect(
      formatProxyAddress({ type: "tcp", address: "::1", port: "80" }),
    ).toBe("tcp:[::1]:80");
  });

  it("does not double-wrap an IPv6 address the user bracketed", () => {
    expect(
      formatProxyAddress({ type: "tcp", address: "[::1]", port: "80" }),
    ).toBe("tcp:[::1]:80");
  });

  it("omits the port for unix sockets", () => {
    expect(
      formatProxyAddress({ type: "unix", address: "/run/sock", port: "80" }),
    ).toBe("unix:/run/sock");
  });

  it.each(["", "::1", "2001:db8::5", "127.0.0.1", "[2001:db8"])(
    "keeps the typed address %s stable while editing",
    (address) => {
      const formatted = formatProxyAddress({
        type: "tcp",
        address,
        port: "80",
      });
      expect(parseProxyAddress(formatted)).toEqual({
        type: "tcp",
        address,
        port: "80",
      });
    },
  );

  it.each([
    "tcp:127.0.0.1:80",
    "tcp:[::1]:80",
    "udp:[2001:db8::5]:8080-8090",
    "tcp::80",
    "tcp:[::1]:",
    "unix:/run/my:socket",
  ])("round-trips %s", (value) => {
    expect(formatProxyAddress(parseProxyAddress(value))).toBe(value);
  });
});
