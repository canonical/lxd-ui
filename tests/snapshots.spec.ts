import { test, Page } from "@playwright/test";
import { TIMEOUT } from "./constants";
import { createInstance, randomInstanceName } from "./instance-helpers";

test("snapshot create restore and remove ", async ({ page }) => {
  const instance = randomInstanceName();
  await createInstance(page, instance);
  const snapshot = randomSnapshotName();
  await createSnapshot(page, instance, snapshot);
  await restoreSnapshot(page, snapshot);
  await deleteSnapshot(page, snapshot);
});

const randomSnapshotName = (): string => {
  const r = (Math.random() + 1).toString(36).substring(7);
  return `playwright-snapshot-${r}`;
};

const createSnapshot = async (
  page: Page,
  instance: string,
  snapshot: string
) => {
  await page.goto(`/`);
  await page.getByPlaceholder("Search").click();
  await page.getByPlaceholder("Search").fill(instance);
  await page.getByRole("link", { name: instance }).first().click();
  await page.getByTestId("tab-link-Snapshots").click();
  await page.getByRole("button", { name: "Create snapshot" }).first().click();
  await page.getByLabel("Snapshot name").click();
  await page.getByLabel("Snapshot name").fill(snapshot);
  await page
    .getByRole("dialog", {
      name: `Create snapshot`,
    })
    .getByRole("button", { name: "Create" })
    .click();

  await page.waitForSelector(`text=Snapshot ${snapshot} created.`, TIMEOUT);
};

const restoreSnapshot = async (page: Page, snapshot: string) => {
  await page
    .getByRole("row", { name: "Name" })
    .filter({ hasText: snapshot })
    .hover();
  await page
    .getByRole("row", { name: "Name" })
    .filter({ hasText: snapshot })
    .getByRole("button", { name: "Restore" })
    .click();
  await page
    .getByRole("dialog", { name: "Confirm restore" })
    .getByRole("button", { name: "Restore" })
    .click();

  await page.waitForSelector(`text=Snapshot ${snapshot} restored.`, TIMEOUT);
};

const deleteSnapshot = async (page: Page, snapshot: string) => {
  await page
    .getByRole("row", { name: "Name" })
    .filter({ hasText: snapshot })
    .hover();
  await page
    .getByRole("row", { name: "Name" })
    .filter({ hasText: snapshot })
    .getByRole("button", { name: "Delete" })
    .click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();

  await page.waitForSelector(`text=Snapshot ${snapshot} deleted.`, TIMEOUT);
};
