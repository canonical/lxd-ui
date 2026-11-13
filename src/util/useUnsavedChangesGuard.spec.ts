import { isWithinFormPath } from "./useUnsavedChangesGuard";

describe("isWithinFormPath", () => {
  const networkUrl = "/ui/project/default/network/foo";
  const instanceUrl = "/ui/project/default/instance/foo/configuration";

  it("matches the form url", () => {
    expect(isWithinFormPath(networkUrl, networkUrl, false)).toBe(true);
    expect(isWithinFormPath(instanceUrl, instanceUrl, true)).toBe(true);
  });

  it("ignores a trailing slash", () => {
    expect(isWithinFormPath(`${networkUrl}/`, networkUrl, false)).toBe(true);
    expect(isWithinFormPath(networkUrl, `${networkUrl}/`, false)).toBe(true);
  });

  it("does not match a tab below the form url without sub paths", () => {
    expect(isWithinFormPath(`${networkUrl}/forwards`, networkUrl, false)).toBe(
      false,
    );
  });

  it("matches a section below the form url with sub paths", () => {
    expect(isWithinFormPath(`${instanceUrl}/storage`, instanceUrl, true)).toBe(
      true,
    );
  });

  it("does not match a resource whose name starts with the same text", () => {
    expect(isWithinFormPath(`${networkUrl}2`, networkUrl, false)).toBe(false);
    expect(
      isWithinFormPath(
        "/ui/project/default/network-acl/x-1",
        "/ui/project/default/network-acl/x",
        true,
      ),
    ).toBe(false);
    expect(
      isWithinFormPath(
        "/ui/project/default/instance/foo2/configuration",
        instanceUrl,
        true,
      ),
    ).toBe(false);
  });

  it("does not match another page", () => {
    expect(
      isWithinFormPath("/ui/project/default/instances", instanceUrl, true),
    ).toBe(false);
  });
});
