import urls, { prefixedURLs } from "./urls";

test("prefixes applied to top level", () => {
  expect(prefixedURLs("/permissions").entitlements).toBe(
    "/permissions/entitlements",
  );
});

test("urls object is not mutated", () => {
  expect(prefixedURLs("/permissions").entitlements).toBe(
    "/permissions/entitlements",
  );
  expect(urls.entitlements).toBe("/entitlements");
});

test("prefixes applied to nested", () => {
  expect(prefixedURLs("/permissions").groups.add).toBe(
    "/permissions/groups/add",
  );
});

test("prefixes applied to paths with arguments", () => {
  expect(prefixedURLs("/permissions").groups.edit({ id: "abc" })).toBe(
    "/permissions/groups/abc/edit",
  );
});

test("handles root", () => {
  expect(prefixedURLs("/").entitlements).toBe("/entitlements");
});

test("handles no leading slash", () => {
  expect(prefixedURLs("permissions").entitlements).toBe(
    "/permissions/entitlements",
  );
});

test("handles trailing slash", () => {
  expect(prefixedURLs("/permissions/").entitlements).toBe(
    "/permissions/entitlements",
  );
});

test("handles no slashes", () => {
  expect(prefixedURLs("permissions").entitlements).toBe(
    "/permissions/entitlements",
  );
});
