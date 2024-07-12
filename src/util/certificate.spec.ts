import { sanitizeOrgName } from "./certificate";

describe("sanitizeOrgName", () => {
  it("replaces invalid chars from an ipv6 string", () => {
    const result = sanitizeOrgName("LXD UI [::1] (Browser Generated)");

    expect(result).toBe("LXD UI ::1 (Browser Generated)");
  });

  it("keeps a valid domain name", () => {
    const result = sanitizeOrgName(
      "LXD UI foo.example.com (Browser Generated)",
    );

    expect(result).toBe("LXD UI foo.example.com (Browser Generated)");
  });

  it("keeps a valid ipv4 address", () => {
    const result = sanitizeOrgName("LXD UI 127.0.0.1 (Browser Generated)");

    expect(result).toBe("LXD UI 127.0.0.1 (Browser Generated)");
  });
});
