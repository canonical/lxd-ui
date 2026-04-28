import type { LxdVersions } from "../fixtures/lxd-test";
import { expect, test } from "../fixtures/lxd-test";
import { randomNameSuffix } from "./name";
import type { Page } from "@playwright/test";
import { gotoURL } from "./navigate";
import { dismissNotification } from "./notification";

export const skipIfNotSupported = (lxdVersion: LxdVersions) => {
  test.skip(
    lxdVersion === "5.0-edge" || lxdVersion === "5.21-edge",
    "Cluster tests not supported for lxd 5.0",
  );
};

export const randomLinkName = (): string => {
  return `playwright-cluster-link-${randomNameSuffix()}`;
};

export const createClusterLink = async (page: Page, link: string) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Clustering" }).click();
  await page.getByRole("link", { name: "Link" }).click();
  await page.getByRole("button", { name: "Create link" }).click();
  await expect(page.getByText("Create cluster link")).toBeVisible();

  await page.getByPlaceholder("Enter name").fill(link);
  const panel = page.getByLabel("Side panel");
  await panel.getByRole("button", { name: "Create link" }).click();

  await expect(page.getByText(`Cluster link ${link} created`)).toBeVisible();
  await page.getByText("I have copied the token").click();
  await page.getByRole("button", { name: "Done" }).click();
};

export const editClusterLink = async (page: Page, link: string) => {
  const row = page.locator("tr").filter({ hasText: link });
  await row.getByRole("button", { name: "Edit cluster link" }).click();
  await expect(page.getByText(`Edit cluster link ${link}`)).toBeVisible();

  const description = "My link";
  await page.getByPlaceholder("Enter description").fill(description);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText(`Cluster link ${link} saved.`)).toBeVisible();

  await expect(row.getByText(description)).toBeVisible();
};

export const deleteClusterLink = async (page: Page, link: string) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Clustering" }).click();
  await page.getByRole("link", { name: "Links" }).click();
  const row = page.locator("tr").filter({ hasText: link });
  await row.getByRole("button", { name: "Delete cluster link" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete cluster link" })
    .click();

  await dismissNotification(page, `Cluster link ${link} deleted.`);
};
