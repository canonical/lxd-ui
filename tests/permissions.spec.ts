import { test, expect } from "./fixtures/lxd-test";
import { gotoURL } from "./helpers/navigate";

test("LXD 5.0 does not support permissions", async ({ page, lxdVersion }) => {
  test.skip(
    lxdVersion !== "5.0-edge",
    "Fine grained authorisation is supported in lxd 5.21 LTS and latest/edge",
  );
  await gotoURL(page, "/ui/");
  await expect(page.getByRole("button", { name: "Permissions" })).toBeHidden();
});
