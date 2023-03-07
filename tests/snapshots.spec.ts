import { test, Page } from "@playwright/test";
import { INSTANCE_NAME, TIMEOUT } from "./constants";

test("snapshot create restore and remove ", async ({ page }) => {
  const snapshot = randomSnapshotName();
  await createSnapshot(page, INSTANCE_NAME, snapshot);
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
  await page.goto(`/ui/instances/detail/${instance}`);
  await page.getByTestId("tab-link-Snapshots").click();
  await page.getByRole("button", { name: "Create snapshot" }).click();
  await page.getByLabel("Snapshot name").click();
  await page.getByLabel("Snapshot name").fill(snapshot);
  await page
    .getByRole("dialog", {
      name: `Create snapshot for ${instance}`,
    })
    .getByRole("button", { name: "Create snapshot" })
    .click();

  await page.waitForSelector(`text=Snapshot ${snapshot} created.`, TIMEOUT);
};

const restoreSnapshot = async (page: Page, snapshot: string) => {
  await page
    .getByRole("row", { name: "Name" })
    .filter({ hasText: snapshot })
    .getByRole("button", { name: "Restore" })
    .click();
  await page
    .getByRole("dialog", { name: "Confirm restore" })
    .getByRole("button", { name: "Restore" })
    .click();

  await page.waitForSelector("text=Snapshot restored", TIMEOUT);
};

const deleteSnapshot = async (page: Page, snapshot: string) => {
  await page
    .getByRole("row", { name: "Name" })
    .filter({ hasText: snapshot })
    .getByRole("button", { name: "Delete" })
    .click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();

  await page.waitForSelector("text=Snapshot deleted", TIMEOUT);
};
