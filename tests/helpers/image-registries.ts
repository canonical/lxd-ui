import { expect, test, type LxdVersions } from "../fixtures/lxd-test";
import type { Page } from "@playwright/test";
import { gotoURL } from "./navigate";
import { randomNameSuffix } from "./name";

export const randomImageRegistryName = () => {
  return `playwright-image-registry-${randomNameSuffix()}`;
};

export const skipIfNotSupported = (lxdVersion: LxdVersions) => {
  test.skip(
    lxdVersion === "latest-edge" ||
      lxdVersion === "5.0-edge" ||
      lxdVersion === "5.21-edge",
    "Image registries page are currently not available",
  );
};

export const visitImageRegistries = async (page: Page) => {
  await gotoURL(page, `/ui/image-registries`);
  await expect(page.getByTitle("Create registry")).toBeVisible();
};
